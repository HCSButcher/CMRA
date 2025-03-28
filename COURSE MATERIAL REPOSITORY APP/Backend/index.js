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
const { isAuthenticated } = require('./middleware/authMiddleware.js');
const { authorizeRoles } = require('./middleware/authMiddleware.js');
const jwt = require('jsonwebtoken');
require('dotenv').config();



//load environment variables from .env file
dotenv.config();

//passport configuration
require('./config/passport')(passport);

app.use(
    cors({
    origin: 'http://localhost:3000',
    credentials: true,
    })
);

app.use(express.json());

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
     app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set true if using HTTPS
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

app.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user) => {
    if (err) {
      return res.status(500).json({ message: "Internal server error", error: err });
    }
    if (!user) {
      return res.status(401).json({ errors: [{ msg: "Invalid email or password" }] });
    }

    req.login(user, { session: false }, (err) => {
      if (err) {
        return res.status(500).json({ message: "Login failed", error: err });
      }

      // Generate short-lived Access Token
      const token = jwt.sign(
        { email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "15m" } // Access token expires in 15 minutes
      );

      // Generate long-lived Refresh Token
      const refreshToken = jwt.sign(
        { email: user.email },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "7d" } // Refresh token expires in 7 days
      );

      // Set Refresh Token in HTTP-Only Cookie
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Define redirect URL based on role
      let redirectUrl = "/login"; // Default in case of an unexpected role
      if (user.email === process.env.SUPER_ADMIN_EMAIL || user.role === "admin") {
        redirectUrl = "/admin";
      } else if (user.role === "student") {
        redirectUrl = "/student";
      } else if (user.role === "lecturer") {
        redirectUrl = "/lecturer";
      }

      // Send response
      return res.status(200).json({
        message: "Login successful",
        redirect: redirectUrl,
        token, // Send short-lived access token
        user: { email: user.email, role: user.role },
      });
    });
  })(req, res, next);
});



// login authentication
app.get("/auth/user", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; // Extract token
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ email: decoded.email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ email: user.email, role: user.role });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Server error" }); // Always return JSON
  }
});

//auth refresh
app.post("/auth/refresh", (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.status(401).json({ message: "Unauthorized" });

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Invalid refresh token" });

    const newAccessToken = jwt.sign(
      { email: decoded.email, role: decoded.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    return res.json({ token: newAccessToken });
  });
});



//get request for logout
app.get("/logout", (req, res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  });

  
  return res.status(200).json({ message: "Logged out successfully" });
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
  
   app.post('/api/refresh-token', async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(401).json({ message: "Unauthorized" });

    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
        const newAccessToken = jwt.sign({ id: decoded.id }, process.env.ACCESS_SECRET, { expiresIn: '15m' });

        res.json({ accessToken: newAccessToken });
    } catch (error) {
        res.status(403).json({ message: "Invalid refresh token" });
    }
});


// Post request for password reset
app.post("/reset", async (req, res) => {
    console.log("📩 Received password reset request:", req.body);

    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ errors: [{ msg: "Email and new password are required." }] });
        }

        // ✅ Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            console.log("❌ No account found for email:", email);
            return res.status(404).json({ errors: [{ msg: "No account with that email exists." }] });
        }

        // ✅ Hash new password and update
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.updateOne({ email }, { $set: { password: hashedPassword } });

        console.log("✅ Password updated successfully for:", user.email);

        // ✅ Clear the refresh token from cookies
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: true,
            sameSite: "Strict",
        });

        return res.json({ message: "✅ Password reset successful! Redirecting to login..." });

    } catch (err) {
        console.error("❌ Error resetting password:", err);
        return res.status(500).json({ errors: [{ msg: "An error occurred. Please try again later." }] });
    }
});



//get students
app.get('/getStudents', isAuthenticated, authorizeRoles("Super-admin", "admin", "lecturer"), async (req, res) => {
    try {
        const students = await User.find(
            { role: 'student' },
            'name email profilePicture'
        );

        if (!students || students.length === 0) {
            return res.status(404).json({ message: 'No students found' });
        }
        
        res.json(students);
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


//get all students info
app.get('/getAllStudents', isAuthenticated, authorizeRoles("Super-admin", "admin", "lecturer"), async (req, res) => {
    try {
        const students = await User.find({ role: 'student' });

        if (!students || students.length === 0) {
            return res.status(404).json({ message: 'No students found' });
        }

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
        if (!deletedStudents) {
            return res.status(400).json({ message: 'Student not found' });
        }
        res.status(200).json({ message: 'Student deleted successfully' });
    } catch (error) {
        console.error('Error deleting student', error);
        res.status(500).json({ message: 'Server error' });
    }
});


 //fetch lecturers
app.get('/getLecturers', isAuthenticated, authorizeRoles("Super-admin", "admin"), async (req, res) => {
    try {
        const lecturers = await User.find(
            { role: 'lecturer' },
            'name email contact profilePicture'  
        );

        res.status(200).json(lecturers);  
    } catch (error) {
        console.error('Error fetching lecturers:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


//lecturer delete
app.delete('/getLecturers/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedLecturer = await User.findByIdAndDelete(id);
        if (!deletedLecturer) {
            return res.status(400).json({ message: 'Lecturer not found' });
        }
        res.status(200).json({ message: 'Lecturer deleted successfully' });
    } catch (error) {
        console.error('Error deleting Lecturer', error);
        res.status(500).json({ message: 'Server error' });
    }
});

//student count
app.get('/countStudents', isAuthenticated, authorizeRoles("Super-admin", "admin"), async (req, res) => {
    try {
        const studentCount = await User.countDocuments({ role: 'student' });
        res.status(200).json({ count: studentCount });
    } catch (error) {
        console.error('Error counting students:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


//lecturer count
app.get('/countLecturers', isAuthenticated, authorizeRoles("Super-admin", "admin"), async (req, res) => {
    try {
        const lecturerCount = await User.countDocuments({ role: 'lecturer' });
        res.status(200).json({ count: lecturerCount });
    } catch (error) {
        console.error('Error counting lecturers:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// school count
app.get('/countSchool', isAuthenticated, authorizeRoles("Super-admin", "admin"), async (req, res) => {
    try {
        const schoolCount = await UnitStage.distinct('school'); // Get distinct school names
        res.status(200).json({ count: schoolCount.length });
    } catch (error) {
        console.error('Error counting schools:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
 
//courses count
app.get('/countCourses', isAuthenticated, authorizeRoles("Super-admin", "admin"), async (req, res) => {
    try {
        const allCourses = await UnitStage.aggregate([
            { $unwind: '$courseName' },
            { $group: { _id: null, totalCourses: { $sum: 1 } } }
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
app.get('/coursesReg', isAuthenticated, async (req, res) => {
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
app.get('/updates', isAuthenticated, async (req, res) => {
    try {
        const updates = await Update.find();
        res.status(200).json({ updates });
    } catch (error) {
        console.error('Error fetching updates:', error);
        res.status(500).json({ message: 'Server error' });
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
    const { school, stage, units } = req.body;

    if (!school || !stage || !units || units.length === 0) {
        return res.status(400).json({ message: 'School, stage, and at least one unit are required' });
    }

    try {
        const newStage = new UnitStage({ school, stage, units });
        await newStage.save();
        res.status(201).json({ message: 'School, stage, and units saved successfully!' });
    } catch (error) {
        console.error('Error saving school, stage, and units:', error);
        res.status(500).json({ message: 'Server error' });
    }
});



//get request for stages
app.get('/stages', isAuthenticated, async (req, res) => {
    try {
        const { school } = req.query; // ✅ Get school from frontend request

        if (!school) {
            return res.status(400).json({ message: "School is required" });
        }

        console.log(`📢 Fetching stages for school: ${school}`); // Debugging log

        // ✅ Find all stages in UnitStage schema where the school matches
        const stages = await UnitStage.find({ school });

        if (!stages.length) {
            return res.status(404).json({ message: "No stages found for this school" });
        }

        res.status(200).json(stages);
    } catch (error) {
        console.error("❌ Error fetching stages:", error);
        res.status(500).json({ message: "Server error" });
    }
});


//get units for specific school and stage 
app.get('/units', isAuthenticated, async (req, res) => {
    try {
        const { school, stage } = req.query;

        if (!school || !stage) {
            return res.status(400).json({ message: "School and Stage are required" });
        }

        console.log(`📢 Fetching units for: School - "${school.trim()}", Stage - "${stage.trim()}"`);

        // ✅ Find the corresponding stage in the UnitStage schema
        const unitStage = await UnitStage.findOne({
            school: { $regex: `^${school.trim()}$`, $options: "i" }, // Case-insensitive match
            stage: { $regex: `^${stage.trim()}$`, $options: "i" }    // Case-insensitive match
        });

        if (!unitStage) {
            console.warn(`⚠️ No matching entry found for School: "${school.trim()}", Stage: "${stage.trim()}"`);
            return res.status(200).json([]); // ✅ Return empty array instead of error
        }

        console.log(`✅ Found Units for ${stage}:`, unitStage.units);

        return res.status(200).json(unitStage.units);
    } catch (error) {
        console.error("❌ Error fetching units:", error);
        return res.status(500).json({ message: "Server error" });
    }
});


//post request for student course registration
app.post('/sRegistrations', async (req, res) => {
    try {
        console.log("📥 Incoming Request Body:", req.body); // ✅ Log received data

        const { school, stage, sDate, unitsTaken, units } = req.body;

        if (!school || !stage || !sDate || !units || units.length === 0) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // ✅ Save registration details without an email field
        const newRegistration = new SRegistration({
            school,
            stage,
            sDate,
            unitsTaken,
            units,
        });

        await newRegistration.save();
        res.status(201).json({ message: 'Registration successful' });
    } catch (error) {
        console.error('❌ Error saving registration:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


//get request for student  course registration
app.get('/sRegistrations', async (req, res) => {
    try {
        // ✅ Fetch all registrations (not filtered by email)
        const sRegistrations = await SRegistration.find();

        // ✅ Format the date before sending the response
        const formattedRegistrations = sRegistrations.map((sRegistration) => {
            const sRegistrationObj = sRegistration.toObject();
            if (sRegistrationObj.sDate) {
                sRegistrationObj.sDate = new Date(sRegistrationObj.sDate).toISOString().split('T')[0];
            }
            return sRegistrationObj;
        });

        return res.status(200).json(formattedRegistrations);
    } catch (error) {
        console.error("❌ Error fetching registrations:", error);
        res.status(500).json({ message: "Server error" });
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

//find lecturer
app.get("/find", isAuthenticated , async (req, res) => {
    const { email } = req.query;

    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }

    try {
        const lecturer = await User.findOne({ email });
        if (!lecturer) {
            return res.status(404).json({ message: "Lecturer not found" });
        }

        res.json(lecturer);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

//course registration get request
app.get('/courses', isAuthenticated, async (req, res) => {
    try {
        const courseRegistrations = await CourseRegistration.find();
        const formattedCourseRegistrations = courseRegistrations.map((courseRegistration) => {
            const courseRegistrationObj = courseRegistration.toObject();
            if (courseRegistrationObj.date) {
                courseRegistrationObj.date = new Date(courseRegistrationObj.date).toISOString().split('T')[0];
            }
            return courseRegistrationObj;
        });
        return res.status(200).json(formattedCourseRegistrations);
    } catch (error) {
        console.error('Error fetching course registrations:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

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
app.get('/announcements', isAuthenticated, async (req, res) => {
    try {
        const announcements = await Announcement.find();
        const formattedAnnouncements = announcements.map((announcement) => {
            const announcementObj = announcement.toObject();
            if (announcementObj.date) {
                announcementObj.date = new Date(announcementObj.date).toISOString().split('T')[0];
            }
            return announcementObj;
        });
        return res.status(200).json(formattedAnnouncements);
    } catch (error) {
        console.error('Error fetching announcements:', error);
        res.status(500).json({ message: 'Server error' });
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



//recent upload delete
app.delete('/materials/:id', async (req, res) => {
    const { id } = req.params;
    
    if (!id || id.length < 10) { 
        return res.status(400).json({ message: 'Invalid or missing ID' });
    }

    try {
        const deletedMaterial = await Material.findByIdAndDelete(id);
        if (!deletedMaterial) {
            return res.status(404).json({ message: 'Material not found' });
        }
        res.status(200).json({ message: 'Material deleted successfully' });
    } catch (error) {
        console.error('Error deleting material:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

//handle material get request
app.get('/materials', isAuthenticated,authorizeRoles("Super-admin", "admin", "lecturer"), async (req, res) => {
    try {
        const { search, recent } = req.query;

        if (search && typeof search !== 'string') {
            return res.status(200).json({ message: 'Search term must be a string' });
        }
        const query = search
            ? {
                $or: [
                    { unit: { $regex: search, $options: 'i' } },
                    { unitName: { $regex: search, $options: 'i' } },
                ],
            }
            : {};
        const sort = recent === 'true' ? { uploadDate: -1 } : {};
        const materials = await Material.find(query).sort(sort);
        res.status(200).json(materials);
    } catch (error) {
        console.error('Error fetching materials', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Fetch individual notes for a unit
app.get('/notes/:unitName', isAuthenticated, async (req, res) => {
    try {
        const { unitName } = req.params;
        console.log("📢 Fetching notes for unit:", unitName);

        const materials = await Material.find({ unit: unitName });

        if (!materials || materials.length === 0) {
            return res.status(404).json({ message: 'No notes found for this unit.' });
        }

        res.status(200).json(materials);
    } catch (error) {
        console.error('❌ Server Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


//handling downloads
app.get('/download/:unitName/:fileName', isAuthenticated, async (req, res) => {
    try {
        const { fileName } = req.params; // Remove unitName since it's not used in the file path

        // Decode the file name
        const decodedFileName = decodeURIComponent(fileName);

        // Construct the actual file path (without unitName)
        const filePath = path.join(__dirname, "uploads", decodedFileName);

        console.log(`📢 Looking for file at: ${filePath}`);

        // Check if the file exists
        if (!fs.existsSync(filePath)) {
            console.error(`❌ File not found: ${filePath}`);
            return res.status(404).json({ message: "File not found on server" });
        }

        // Set headers and send the file
        res.setHeader('Content-Disposition', `attachment; filename="${decodedFileName}"`);
        res.setHeader('Content-Type', 'application/octet-stream');

        res.sendFile(filePath);
    } catch (error) {
        console.error("❌ Error downloading file:", error);
        res.status(500).json({ message: "Server error" });
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
app.get('/comments', isAuthenticated, async (req, res) => {
    try {
        const comments = await Comment.find();
        res.status(200).json(comments);
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ error: 'Server error' });
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
    let { email, registrationNumber, course, school } = req.body;

    if (!email || !registrationNumber || !course || !school) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    email = email.toLowerCase(); // Ensure consistency

    // Check if student exists
    const student = await User.findOne({ email });

    if (!student) {
      console.error(`❌ Student with email ${email} not found`);
      return res.status(404).json({ message: 'Student not found' });
    }

    console.log(`✅ Student found:`, student); // Debugging

    // Check if school is missing
    if (!student.school) {
      console.error(`❌ Student ${email} does not have a school assigned`);
    }

    // Update details
    student.registrationNumber = registrationNumber;
    student.course = course;
    student.school = school;

    await student.save(); // Save changes

    console.log(`✅ Updated student:`, student); // Debugging
    res.json({ message: 'Student enrolled successfully', student });
  } catch (error) {
    console.error('❌ Error enrolling student:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

//student plus email 
app.get('/student/:email', async (req, res) => {
    try {
        const email = req.params.email.toLowerCase();
        const student = await User.findOne({ email });
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        if (student.role !== 'student') {
            return res.status(403).json({ message: 'Access denied. User is not a student.' });
        }
        res.json({
            _id: student._id,
            name: student.name,
            email: student.email,
            role: student.role,
            school: student.school,
            course: student.course
        });
    } catch (error) {
        console.error('Error fetching student:', error)
        res.status(500).json({ message: 'Internal Server error' });
    }
});

//lecturer email
app.get('/lecturer/:email', async (req, res) => {
    try {
        const email = req.params.email.toLowerCase(); 
        const lecturer = await User.findOne({ email });

        if (!lecturer) {
            return res.status(404).json({ message: "Lecturer not found" });
        }

        if (lecturer.role !== "lecturer") {
            return res.status(403).json({ message: "Access denied. User is not a lecturer." });
        }
        
        res.json({
            _id: lecturer._id,
            name: lecturer.name,
            email: lecturer.email,
            role: lecturer.role,  
            school: lecturer.school || "N/A",
            course: lecturer.course || "N/A"
        });
    } catch (error) {
        console.error("Error fetching lecturer:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


//handling wrong routes
app.use((req, res)=>{
    res.status(400).json({msg: 'Route not found'});
});