const express= require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const morgan = require ('morgan')
const multer = require('multer')
const path = require('path');
const fs = require('fs');
const app = express()
const Comment = require('./Models/Comment.js')
const SRegistration = require ('./Models/SRegistration.js')
const UnitStage = require('./Models/Stage.js')
const Update = require ('./Models/Update.js')
const Material = require ('./Models/Material.js')
const User = require ('./Models/User.js')
const Announcement = require ('./Models/Announcement.js')
const CourseRegistration = require ('./Models/CourseRegistration.js')
const session = require('express-session')
const flash = require('connect-flash')
const bcrypt = require('bcryptjs');
const passport = require('passport');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const compression = require('compression')
const authenticateToken = require('./config/requireAuth.js');
const jwt = require('jsonwebtoken');
require('dotenv').config();

//define super-user
const SUPER_ADMIN_EMAIL = 'trevor254oduol@gmail.com';

//load environment variables from .env file
dotenv.config();

//passport configuration
require('./config/passport')(passport);
app.use(express.json())
app.use(cors())

app.use(compression())
// Connect to MongoDB
const dbURL = 'mongodb+srv://Butcher:Butchervybz1.@nodetuts.yzl3tct.mongodb.net/Logins?retryWrites=true&w=majority&appName=Nodetuts';
mongoose.connect(dbURL)
.then(() => {
        app.listen(3001, () => {
          console.log('Server listening on port 3001');
        });
        console.log('Database Connected');
      })
      .catch(err => {
        console.log(err);
      });
      
      //express session
      app.use(session ({
        secret: 'secret',
        resave: false,
        saveUninitialized: true
      }));
      
      //connect flash
      app.use(flash());
      
// Setup Nodemailer
require('dotenv').config(); // Ensure you load environment variables

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // Use `true` for port 465, `false` for 587
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});


 //global variables
 app.use((req,res, next) => {
res.locals.success_msg = req.flash('success_msg');
res.locals.error_msg = req.flash('error_msg');
 res.locals.error = req.flash('error');
res.locals.searchResults = [];
next();
});
      
//for conversion in between the data
app.use(express.urlencoded({ extended: false}));
 app.use(express.json());
 app.use(morgan('Dev'));
      
        
 //express body parser for static files
app.use(express.static('public'));
      
//passport middleware
 app.use(passport.initialize());
app.use(passport.session());
      
// Serve static files (e.g., profile pictures)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Setup multer storage for file uploads (e.g., lecture notes)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads'); // Directory to store the uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Renaming the file to avoid name conflicts
  }
});

// Initialize multer with storage configuration
const upload = multer({ storage });

// Post request for register
app.post('/register', upload.single('file'), async (req, res) => {
    try {
        const { name, email, role, password, contact } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: 'Profile picture is required' });
        }

        const filePath = `uploads/profiles/${email}_${req.file.filename}`;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            role,
            password: hashedPassword,
            contact,
            profilePicture: filePath, // Ensure this matches your schema
        });

        await newUser.save();
        return res.json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error registering user:', error);
        return res.status(500).json({ message: 'Server error' });
    }
});

// Post for login


app.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user) => {
        if (err) {
            return res.status(500).json({ message: 'Internal server error', error: err });
        }
        if (!user) {
            return res.status(401).json({ errors: [{ msg: 'Invalid email or password' }] });
        }

        req.login(user, (err) => {
            if (err) {
                return res.status(500).json({ message: 'Login failed', error: err });
            }

            // Generate JWT token with user email and role
            const token = jwt.sign(
                { email: user.email, role: user.role }, 
                'your_jwt_secret', 
                { expiresIn: '1h' }
            );

            // Determine redirect URL based on role
            let redirectUrl;
            if (user.email === process.env.SUPER_ADMIN_EMAIL) {
                redirectUrl = '/admin';
            } else if (user.role === 'admin') {
                redirectUrl = '/admin';
            } else if (user.role === 'student') {
                redirectUrl = '/student';
            } else {
                redirectUrl = '/lecturer';
            }

            return res.json({ 
                message: 'Login successful', 
                redirect: redirectUrl, 
                token,   // Send token for authentication
                user: { email: user.email, role: user.role }
            });
        });
    })(req, res, next);
});


//get request for logout
app.get('/logout', (req, res) => {
    res.clearCookie('connect.sid'); // Clear session cookie (if using express-session)
    res.json({ message: 'Logout successful' });
});


//api communication handling
   app.get('/api/messages', (req, res) => {
    const messages = {
      success_msg: req.flash('success_msg') || '', // Empty string if no message
      error_msg: req.flash('error_msg') || '',     // Empty string if no message
      errors: req.flash('errors') || [],           // Empty array for errors
    };
    res.json(messages);
  });

// Post request for password reset
app.post('/reset', async (req, res) => {
    console.log('Received reset request:', req.body);
    try {
        const { email } = req.body;
        const token = crypto.randomBytes(20).toString('hex');

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ errors: [{ msg: 'No account with that email address exists.' }] });
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        const resetUrl = `http://${req.headers.host}/reset/${token}`;
        const mailOptions = {
            to: user.email,
            from: process.env.EMAIL_USER, // Replace with your actual email
            subject: 'Password Reset',
            html: `You are receiving this because you (or someone else) have requested the reset of the password for your account.<br><br>
            Please click on the following link, or paste this into your browser to complete the process:<br><br>
            <a href="${resetUrl}">Reset Your Password</a><br><br>
            If you did not request this, please ignore this email and your password will remain unchanged.<br>`,
        };

        await transporter.sendMail(mailOptions);
        return res.json({ message: `An e-mail has been sent to ${user.email} with further instructions.` });
    } catch (err) {
        console.error(err); // Log the error for debugging
        return res.status(500).json({ errors: [{ msg: 'An error occurred. Please try again later.' }] });
    }
});

app.post('/resetpassword/:token', async (req, res) => {
    try {
        const { password, password2 } = req.body;

        // Check if passwords match
        if (password !== password2) {
            return res.status(400).json({ errors: [{ msg: 'Passwords do not match.' }] });
        }

        // Find user with valid token
        const user = await User.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ errors: [{ msg: 'Password reset token is invalid or has expired.' }] });
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        // Clear reset token fields
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        // Send confirmation email
        const mailOptions = {
            to: user.email,
            from: process.env.SMTP_USER,
            subject: 'Your password has been changed',
            text: `Hello,\n\nThis is a confirmation that the password for your account ${user.email} has just been changed.\n`
        };

        await transporter.sendMail(mailOptions);

        return res.json({ message: 'Success! Your password has been changed.' });
    } catch (err) {
        console.error('Reset Password Error:', err);
        return res.status(500).json({ errors: [{ msg: 'An error occurred. Please try again later.' }] });
    }
});

//get students
app.get('/getStudents', async (req, res) => {
  try {
    // Fetch students with the role of "student" and only specific fields
    const students = await User.find({ role: 'student' }, 'name  email profilePicture');
    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
//get all students info
app.get('/getAllStudents', async (req, res) => {
  try {
    // Fetch students with the role of "student" and only specific fields
    const students = await User.find({ role: 'student' });
    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

//student delete
app.delete('/getStudents/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedStudents = await User.findByIdAndDelete(id);
        if (deletedStudents) {
            return res.status(400).json({ message: 'Student not found' });
        }
        res.status(200).json({ message: 'Student deleted successfully' });
    } catch (error) {
        console.error('Error deleting student', error);
        res.status(500).json({ message: 'Server error' });
    }
});


 //fetch lecturers
app.get('/getLecturers', async (req, res) => {
  try {
  
    const lecturers = await User.find({role:'lecturer'});
    res.json(lecturers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

//lecturer delete
app.delete('/getLecturers/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedLecturer = await User.findByIdAndDelete(id);
        if (deletedLecturer) {
            return res.status(400).json({ message: 'Lecturer not found' });
        }
        res.status(200).json({ message: 'Lecturer deleted successfully' });
    } catch (error) {
        console.error('Error deleting Lecturer', error);
        res.status(500).json({ message: 'Server error' });
    }
});

//student count
app.get('/countStudents', async (req, res) => {
  try {
   
    const studentCount = await User.countDocuments({ role: 'student' });  

    res.status(200).json({ count: studentCount });
  } catch (error) {
    console.error('Error counting students', error);
    res.status(500).json({ message: 'Server error' });
  }
});

//lecturer count
app.get('/countLecturers', async (req, res) => {
  try {
    const lecturerCount = await User.countDocuments({ role: 'lecturer' });
    res.status(200).json({ count: lecturerCount });
  } catch (error) {
    console.error('Error counting lecturers', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// school count
app.get('/countSchool', async (req, res) => {
    try {
        const schoolCount = await UnitStage.distinct('school'); // Gets unique school names
        res.status(200).json({ count: schoolCount.length }); // Counts unique schools
    } catch (error) {
        console.error('Error counting schools:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

 
//courses count
app.get('/countCourses', async (req, res) => {
    try {
        const allCourses = await UnitStage.aggregate([
            { $unwind: "$courseName" }, // Unwind the array
            { $group: { _id: null, totalCourses: { $sum: 1 } } } // Count total
        ]);
        const courseCount = allCourses.length > 0 ? allCourses[0].totalCourses : 0;
        res.status(200).json({ count: courseCount });
    } catch (error) {
        console.error('Error counting courses:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

//post request for courses
app.post('/coursesReg', async (req, res) => {
    const { school, courseName } = req.body;
    try {
        const newCourse = new UnitStage({ school, courseName });
        await newCourse.save();
        res.status(201).json({ message: 'School and courses saved successfully!' });
    } catch (error) {
        console.error('Error saving school and courses', error);
        res.status(500).json({ message: 'Server error' });
    }
});

//get request for courses
app.get('/coursesReg', async (req, res) => {
    try {
        const courses = await UnitStage.find();
        res.status(200).json(courses);
    } catch (error) {
        console.error('Error fetching courses', error);
        res.status(500).json({ message: 'Server error' });
    }
});

//delete school
app.delete('/coursesReg/:school', async (req, res) => {
    try {
        const { school } = req.params;

        // Find and delete the school by its name
        const deletedSchool = await UnitStage.findOneAndDelete({ school });

        if (!deletedSchool) {
            return res.status(404).json({ message: 'School not found' });
        }

        res.status(200).json({ message: 'School and its courses deleted successfully', deletedSchool });
    } catch (error) {
        console.error('Error deleting school:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

//delete individual course
app.delete('/deleteCourse', async (req, res) => {
    const { school, course } = req.body;
    if (!school || !course) {
        return res.status(400).json({ error: "Both 'school' and 'course' are required" });
    }

    try {
        const updatedCourse = await UnitStage.findOneAndUpdate(
            { school },
            { $pull: { courseName: course } },
            { new: true }
        );
        if (!updatedCourse) {
            return res.status(400).json({ message: 'School not found or course does not exist' });
        }
        return res.status(200).json({
            message: ` course"${course} "deleted successfully from "${school}." `,
            updatedSchool: updatedCourse
        });
    } catch (error) {
        console.error('Error deleting course:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});


// endpoint for update
app.post('/updates', async (req, res) => {
        const { unit, unitName } = req.body;
        let errors = [];

        // Validate input
        if (!unit || !unitName) {
            errors.push({ msg: 'Please enter all fields' });
        }
        
        if (errors.length > 0) {
            return res.status(400).json({ errors });
        }
        try{       
        const existingUpdate = await Update.findOne({ unit });
        if (existingUpdate) {
            await Update.deleteOne({ unit });
            console.log('Existing unit deleted successfully');
        }
        
        const update = new Update({
            unit,
            unitName,
        });
        await update.save();        
    } catch (err) {
        console.error('Error creating update:', err); // Updated error message
        res.status(500).send('Server error');
    }
});

// Get request for update
app.get('/updates', async (req, res) => {
    try {
        const updates = await Update.find();
     res.json(updates)
    } catch (error) {
        console.error('Error fetching updates:', error);
        res.status(500).send('Server error');
    }
});

//handle updates delete
app.delete('/updates/:id', async(req, res) => {
    try {
        const {id} = req.params;
        const deletedUpdate = await Update.findByIdAndDelete(id);
        if (!deletedUpdate) {
            return res.status(404).json({message: 'Update not found'});
        }
        res.status(200).json({message: 'update deleted successfully'})
    } catch (error) {
        console.error('Error deleting update', error)
        res.status(500).json({ message: 'Server error'});
    }
});

//post request for stages
app.post('/stages', async (req, res) => {
    const { stage, units } = req.body;

    try {
        const newStage = new UnitStage({ stage, units });
        await newStage.save();
        res.status(201).json({ message: 'Stage and units saved successfully!' });
    } catch (error) {
        console.error('Error saving stage and units:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


//get request for stages
app.get('/stages', async (req, res) => {
    try {
        const stages = await UnitStage.find();
        res.status(200).json(stages);
    } catch (error) {
        console.error('Error fetching stages:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

//post request for student course registration
app.post('/sRegistrations', async (req, res) => {
    const { stage, sDate, units, unitsTaken } = req.body;

    // Validate the input
    if (!stage || !sDate || !Array.isArray(units) || units.length === 0) {
        return res.status(400).json({ message: 'Invalid input data. Please provide stage, date, and units.' });
    }

    try {
        // Create the new registration
        const sRegistration = new SRegistration({
            stage,
            sDate,
            units,
            unitsTaken
        });

        // Save the registration to the database
        await sRegistration.save();

        // Respond with success message
        res.status(201).json({
            message: 'Registration successful!',
            registration: {
                stage,
                sDate,
                unitsTaken,                
                units
            }
        });

    } catch (error) {
        console.error('Error saving registration', error);
        res.status(500).json({ message: 'Server error, please try again later.' });
    }
});


//get request for student  course registration
app.get('/sRegistrations', async (req, res) => {
    try {
        const sRegistrations = await SRegistration.find();
        const formattedSRegistrations = sRegistrations.map((sRegistration) => {
            const sRegistrationObj = sRegistration.toObject();
            if (sRegistrationObj.sDate) {
                sRegistrationObj.sDate = new Date(sRegistrationObj.sDate).toISOString().split('T')[0];
            }
            return sRegistrationObj;
        });
        return res.status(200).json(formattedSRegistrations);
    } catch (error) {
        console.error('Error fetching registrations:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

//handle dop unit
app.delete('/sRegistrations/:id/:unit', async (req, res) => {
    try {
        const { id, unit } = req.params;

        // Update the document by pulling (removing) the specific unit from the array
        const updatedRegistration = await SRegistration.findByIdAndUpdate(
            id,
            { $pull: { units: unit } },
            { new: true } // This option returns the modified document
        );

        if (!updatedRegistration) {
            return res.status(404).json({ message: 'Registration not found' });
        }

        res.status(200).json({ message: 'Unit deleted successfully', updatedRegistration });
    } catch (error) {
        console.error('Error deleting unit:', error);
        res.status(500).json({ message: 'Server error' });
    }
});



//course registration post request
app.post('/courses', async (req, res) => {
    const { stage, regDate, schoolUnits } = req.body;
    let errors = [];

    // Validation for required fields and at least one school unit
    if (!stage || !regDate || !schoolUnits || schoolUnits.length === 0) {
        errors.push({ msg: 'Please enter all fields and at least one school' });
    }

    // Validate each school unit has both school name and units
    schoolUnits.forEach((unit) => {
        if (!unit.school || !unit.units) {
            errors.push({ msg: 'Each school must have a name and units taken' });
        }
    });

    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    try {        
        const existingCourseRegistration = await CourseRegistration.findOne({ stage });
        if (existingCourseRegistration) {
            await CourseRegistration.deleteOne({ stage });
            console.log('Existing Course Registration details deleted successfully');
        }
        // Create and save the course registration
        const courseRegistrations = new CourseRegistration({
            stage,
            regDate,
            schoolUnits,
        });
        await courseRegistrations.save();
        console.log('New course registration created successfully');
        return res.status(200).json({ msg: 'Course registration created successfully', courseRegistrations });
    } catch (err) {
        console.error('Error creating course registration:', err);
        res.status(500).send('Server error');
    }
});


//course registration get request
app.get('/courses', async(req, res) =>{
    try {
        const courseRegistrations = await CourseRegistration.find();
        const formattedCourseRegistrations = courseRegistrations.map((courseRegistration)=> {
            const courseRegistrationObj = courseRegistration.toObject();
            if(courseRegistrationObj.date) {
                courseRegistrationObj.date = new Date(courseRegistrationObj.date).toISOString().split('T')[0];
            }
            return courseRegistrationObj;
        })
        return res.status(200).json(formattedCourseRegistrations);
    } catch (error) {
        console.error('Error fetching course Registration:', error);
        res.status(500).json({message: 'Server error'});
    }
})

//handle course registration delete
app.delete('/courses/:id', async(req, res) => {
    try {
        const {id} = req.params;
        const deletedCourseRegistration = await CourseRegistration.findByIdAndDelete(id);
        if (!deletedCourseRegistration) {
            return res.status(404).json({message:'Course Registration not found'});
        }
        res.status(200).json({ message:'Course Registration deleted successfully'})
    } catch (error) {
        console.error('error deleting Course Registration', error)
        res.status(500).json({message: 'Server error'})
    }
});


// Announcement POST request
app.post('/announcements', async (req, res) => {
    const { unit, date, announcements } = req.body; 
    let errors = [];
    
    // Validation check for required fields
    if (!unit || !date || !announcements) {
        errors.push({ msg: 'Please enter all fields' });
    }
    
    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    try {
        // Check for an existing announcement for the same unit
        const existingAnnouncement = await Announcement.findOne({ unit });
        if (existingAnnouncement) {
            await Announcement.deleteOne({ unit });
            console.log('Existing announcement deleted successfully');
        }

        // Create and save a new announcement
        const announcement = new Announcement({
            unit,
            date,
            announcements,
        });
        await announcement.save();
        
        console.log('New announcement created successfully');
        return res.status(201).json({ msg: 'Announcement created successfully', announcement });
    } catch (err) {
        console.error('Error creating announcement:', err);
        res.status(500).json({message: 'Server error'});
    }
});

// Announcement GET request
app.get('/announcements', async (req, res) => {
    try {      
        const announcements = await Announcement.find();
        const formattedAnnouncements = announcements.map((announcement)=> {
            const announcementObj = announcement.toObject();
            if(announcementObj.date) {
                announcementObj.date = new Date(announcementObj.date).toISOString().split('T')[0];
               
            }
            return announcementObj;
        })
        return res.status(200).json(formattedAnnouncements); // Return announcements array to the client
    } catch (error) {
        console.error('Error fetching announcements:', error);
        res.status(500).json({message: 'Server error'});
    }
});


//handle announcement delete
app.delete('/announcements/:id', async(req, res)=> {
    try{
        const {id} = req.params;
        const deletedAnnouncement = await Announcement.findByIdAndDelete(id);
        if (!deletedAnnouncement) {
            return res.status(404).json({ message: 'Announcement not found'});
        }
        res.status(200).json({ message: 'Announcement deleted successfully'});
    } catch ( error) {
        console.error('error deleting announcement', error);
        res.status(500).json({ message: 'Server error'});
    }
});


//post request for uploading materials
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const { name, email, unit, unitName, uploadDate } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const filePath = `uploads/${unit}/${req.file.filename}`;

    // Check if a material already exists for the same unit
    const existingMaterial = await Material.findOne({ email, unit });

    if (existingMaterial) {
      const isDuplicate = existingMaterial.filePath.some(
        (file) => file.unitName === unitName
      );

      if (!isDuplicate) {
        existingMaterial.filePath.push({ unitName, filePath });
        await existingMaterial.save();
        return res.json({ message: 'File added to existing material' });
      } else {
        return res.status(400).json({
          message: 'Note with the same unit name already exists',
        });
      }
    }

    // Create a new material entry
    const newMaterial = new Material({
      name,
      email,
      unit,
      uploadDate,
      filePath: [{ unitName, filePath }],
    });

    await newMaterial.save();
    return res.json({ message: 'Material uploaded successfully' });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

//handle material get request
app.get('/materials', async (req, res) => {
  try {
    const { search, recent } = req.query;

    // Ensure search is a string if provided
    if (search && typeof search !== 'string') {
      return res.status(400).send('Search term must be a string');
    }

    // Build query to filter based on search term if provided
    const query = search
      ? {
          $or: [
            { unit: { $regex: search, $options: 'i' } },
            { unitName: { $regex: search, $options: 'i' } }
          ]
        }
      : {};  // If no search term, we don't filter by unit or unitName

    // Add sorting by uploadDate in descending order if `recent` is set
    const sort = recent === 'true' ? { uploadDate: -1 } : {};  // Default is no sorting

    // Query the database with optional search and sorting
    const materials = await Material.find(query).sort(sort);

    res.json(materials);
  } catch (error) {
    console.error('Error fetching materials:', error);
    res.status(500).send('Server error');
  }
});

//handling downloads
app.get('/download/:unitId/:fileName', async (req, res) => {
  try {
    const { unitId, fileName } = req.params;

    // Find the material in the database
    const material = await Material.findOne({ unit: unitId });
    if (!material) {
      return res.status(404).send('Material not found');
    }

    // Find the specific filePath for the fileName
    const file = material.filePath.find((f) => f.unitName === fileName);
    if (!file) {
      return res.status(404).send('File not found');
    }

    // Construct the full file path
    const filePath = path.resolve(file.filePath);
    if (!fs.existsSync(filePath)) {
      return res.status(404).send('File not found on server');
    }

    // Set the headers for direct download
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', 'application/octet-stream');

    // Send the file for download
    res.sendFile(filePath);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});


// Fetch individual notes for a unit
app.get('/notes/:unitId', async (req, res) => {
  try {
    const { unitId } = req.params;
    const materials = await Material.find({ unit: unitId });

    if (!materials || materials.length === 0) {
      return res.status(404).json({ message: 'No notes found for this unit.' });
    }

    res.json({ notes: materials });
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Download material file
app.get('/download/:filePath', async (req, res) => {
  try {
    const { filePath } = req.params;
    const decodedPath = decodeURIComponent(filePath); // Handle encoded paths

    const resolvedPath = path.resolve(decodedPath);

    if (!fs.existsSync(resolvedPath)) {
      return res.status(404).json({ message: 'File not found on server' });
    }

    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${path.basename(resolvedPath)}"`
    );
    res.setHeader('Content-Type', 'application/octet-stream');

    res.sendFile(resolvedPath);
  } catch (error) {
    console.error('Error in download route:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});


//post request for comments
app.post('/comments', async(req, res) => {
    const {unit, comments} = req.body
    let errors= [];
    
    if(!unit || !comments) {
        errors.push({msg:'please enter all fields'});
    }
    if (errors.length > 0) {
        return res.status(400).json({errors})
    }
    try {      
        const Comments = new Comment({
            unit,
            comments,
        });
        await Comments.save();
    } catch (err) {
        console.error('Error creating update:', err);
        res.status(500).send('Server error')
    }
});

//get request for comments
app.get('/comments', async (req, res) => {
    try {
        const comments = await Comment.find(); // Fetch all comments
        res.json(comments);
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ error: 'Server error' }); // More structured response
    }
});


//handle comments delete
app.delete('/comments/:id', async(req, res) => {
    try {
        const {id} =req.params;
        const deletedComments = await Comment.findByIdAndDelete(id);
        if (deletedComments) {
            return res.status(404).json({message: 'Comment not found'});
        }
        res.status(200).json({message: 'Comment deleted successfully'})
    } catch(error) {
        console.error('Error deleting comment', error)
        res.status(500).json({message: 'Server error'})
    }
});


//post request for enrollment
app.post('/enrollStudent', async (req, res) => {
  try {
    const { email, registrationNumber, course } = req.body;

    // Find the student by email and update their registration number and course
    const updatedStudent = await User.findOneAndUpdate(
      { email },
      { $set: { registrationNumber, course } }, // Update/add fields
      { new: true } // Return the updated document
    );

    if (!updatedStudent) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({ message: 'Student enrolled successfully', student: updatedStudent });
  } catch (error) {
    console.error('Error enrolling student:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

//handling wrong routes
app.use((req, res)=>{
    res.status(400).json({msg: 'Route not found'});
});