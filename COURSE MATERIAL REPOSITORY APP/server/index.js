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
const cookieParser = require("cookie-parser");
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
    origin: [
      'https://project-2-1-fq45.onrender.com'// ✅ Your Render frontend URL
     // ✅ Keep if you still use local dev
    ],
    credentials: true,
  })
);


app.use(express.json());

app.use(cookieParser());

app.use(compression())
// Connect to MongoDB
const dbURL = 'mongodb+srv://Butcher:Butchervybz1.@nodetuts.yzl3tct.mongodb.net/Logins?retryWrites=true&w=majority&appName=Nodetuts';
mongoose.connect(dbURL)
.then(() => {
        app.listen(3001,'0.0.0.0', () => {
          console.log('Server running on http://0.0.0.0:3001');
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

        // Send email to super admin and admins
        const admins = await User.find({ role: { $in: ['superadmin', 'admin'] } });  // Fetch users with role 'admin' or 'superadmin'

        const adminEmails = admins.map(admin => admin.email);  // Extract admin emails

        const mailOptions = {
            from: process.env.SMTP_USER,  // Your email
            to: adminEmails,  // Array of admin emails
            subject: 'New User Registration',
            text: `A new user has registered.\n\nName: ${name}\nEmail: ${email}\nRole: ${role}\nContact: ${contact}\n\nPlease review the user details.`,
        };

        await transporter.sendMail(mailOptions);

        return res.json({ message: 'User registered successfully and notification sent to admins' });
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

const generateTokens = (user) => {
    const accessToken = jwt.sign({ email: user.email, role: user.role }, "ACCESS_SECRET", { expiresIn: "15m" });
    const refreshToken = jwt.sign({ email: user.email }, "REFRESH_SECRET", { expiresIn: "7d" });

    return { accessToken, refreshToken };
};

app.post("/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user || user.password !== password) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Generate tokens
        const { accessToken, refreshToken } = generateTokens(user);

        // ✅ Set refresh token in HTTP-only cookie
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false, // Set to true in production with HTTPS
            sameSite: "Strict"
        });

        return res.json({ accessToken });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ message: "Server error" });
    }
});


app.get("/auth/verify", async (req, res) => { 
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {        
        return res.status(401).json({ message: "No token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);        
        res.status(200).json({ user: { email: decoded.email, role: decoded.role } });
    } catch (error) {
        console.error(" Invalid token:", error);
        res.status(401).json({ message: "Invalid token" });
    }
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
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ errors: [{ msg: "Email and new password are required." }] });
        }

        const user = await User.findOne({ email });
        if (!user) {           
            return res.status(404).json({ errors: [{ msg: "No account with that email exists." }] });
        }

        // Replace only the password, keep the rest of the user details unchanged
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.updateOne({ email }, { $set: { password: hashedPassword } });

        // Return a success message
        return res.json({ 
            success: true, 
            message: "✅ Password reset successful! You can now log in with the new password." 
        });

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

//delete
app.delete('/deleteStudent/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid student ID format" });
        }

        const deletedStudent = await User.findByIdAndDelete(id);

        if (!deletedStudent) {
            return res.status(404).json({ message: "Student not found" });
        }

        return res.status(200).json({ message: "Student deleted successfully", deletedStudent });
    } catch (error) {
        console.error("❌ Error deleting student:", error);
        return res.status(500).json({ message: "Server error" });
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
    try {      

        const { unit, email, unitName } = req.body;
        let errors = [];

        // Validate input
        if (!unit || !unitName || !email) {
            errors.push({ msg: 'Please enter all fields' });
            return res.status(400).json({ errors }); 
        }

        // Check if update already exists and delete it
        const existingUpdate = await Update.findOne({ unit });
        if (existingUpdate) {
            await Update.deleteOne({ unit });            
        }

        // Save new update
        const update = new Update({ unit, email, unitName });
        await update.save();
       
        return res.status(201).json({ message: "Update added successfully", update });

    } catch (err) {
        console.error('Error creating update:', err);
        return res.status(500).json({ message: 'Server error' });
    }
});


// Get request for update
app.get('/updates',isAuthenticated, async (req, res) => {
    try {
       
        let query = {}; // Default: Admins see all updates

        // 🔹 Restrict lecturers to only their updates
        if (req.user?.role === "lecturer") {
            query.email = req.user.email; // Assuming updates have an 'email' field
        }

        const updates = await Update.find(query); 
        
        return res.status(200).json({ updates });

    } catch (error) {
        console.error(" Error fetching updates:", error);
        return res.status(500).json({ message: "Server error" });
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
        const { school } = req.query; 

        if (!school) {
            return res.status(400).json({ message: "School is required" });
        }

       
        const stages = await UnitStage.find({ school });

        if (!stages.length) {
            return res.status(404).json({ message: "No stages found for this school" });
        }

        res.status(200).json(stages);
    } catch (error) {
        console.error(" Error fetching stages:", error);
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

        const unitStage = await UnitStage.findOne({
            school: { $regex: `^${school.trim()}$`, $options: "i" }, // Case-insensitive match
            stage: { $regex: `^${stage.trim()}$`, $options: "i" }    // Case-insensitive match
        });

        if (!unitStage) {
            console.warn(`⚠️ No matching entry found for School: "${school.trim()}", Stage: "${stage.trim()}"`);
            return res.status(200).json([]); // ✅ Return empty array instead of error
        }

       
        return res.status(200).json(unitStage.units);
    } catch (error) {
        console.error(" Error fetching units:", error);
        return res.status(500).json({ message: "Server error" });
    }
});


//post request for student course registration
app.post('/sRegistrations', async (req, res) => {
    try {
        
        const { school, stage, sDate, unitsTaken, email, units } = req.body;

        if (!school || !stage || !sDate || !units || units.length === 0) {
            return res.status(400).json({ message: 'All fields are required' });
        }

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
app.post('/courses', isAuthenticated, async (req, res) => {
    const { stage, regDate, schoolUnits } = req.body;
    const email = req.user.email; // ✅ Get email from authenticated user

    let errors = [];

    if (!stage || !regDate || !schoolUnits || schoolUnits.length === 0) {
        errors.push({ msg: 'Please enter all fields and at least one school' });
    }

    schoolUnits.forEach((unit) => {
        if (!unit.school || !unit.units) {
            errors.push({ msg: 'Each school must have a name and units taken' });
        }
    });

    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    try {        
        const existingCourseRegistration = await CourseRegistration.findOne({ stage, email });

        if (existingCourseRegistration) {
            
            existingCourseRegistration.schoolUnits = [...existingCourseRegistration.schoolUnits, ...schoolUnits];
            existingCourseRegistration.regDate = regDate; 
            await existingCourseRegistration.save();            
            return res.status(200).json({ msg: 'Course registration updated successfully', existingCourseRegistration });
        }

        
        const courseRegistration = new CourseRegistration({
            stage,
            regDate,
            schoolUnits,
            email,
        });

        await courseRegistration.save();        
        return res.status(200).json({ msg: 'Course registration created successfully', courseRegistration });
    } catch (err) {
        console.error('Error creating/updating course registration:', err);
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
app.get('/courses', isAuthenticated, authorizeRoles("Super-admin", "admin", "lecturer"), async (req, res) => {
    try {
        
        let query = {}; 
        
        if (req.user.role === "lecturer") {
            query.email = req.user.email; // Filtering based on lecturer's email
        }

        const courseRegistrations = await CourseRegistration.find(query);

        
        const formattedCourseRegistrations = courseRegistrations.map((courseRegistration) => {
            const courseRegistrationObj = courseRegistration.toObject();
            if (courseRegistrationObj.regDate) {
                courseRegistrationObj.regDate = new Date(courseRegistrationObj.regDate).toISOString().split('T')[0];
            }
            return courseRegistrationObj;
        });
        
        return res.status(200).json(formattedCourseRegistrations);
    } catch (error) {
        console.error(" Error fetching course registrations:", error);
        res.status(500).json({ message: "Server error" });
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
app.post('/announcements', isAuthenticated, async (req, res) => {
    const { unit, email, date, announcements } = req.body;
    let errors = [];

    // Check if required fields are filled
    if (!unit || !email || !date || !announcements) {
        errors.push({ msg: 'Please enter all fields' });
    }

    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    try {
        // Check if the same unit has an existing announcement
        const existingAnnouncement = await Announcement.findOne({ unit });
        if (existingAnnouncement) {
            await Announcement.deleteOne({ unit });            
        }

        // Save new announcement
        const announcement = new Announcement({ unit, email, date, announcements });
        await announcement.save();        
       
        return res.status(201).json({ msg: 'Announcement created successfully', announcement });
    } catch (err) {
        console.error(' Error creating announcement:', err);
        return res.status(500).json({ message: 'Server error' });
    }
});

// Announcement GET request
app.get('/announcements', isAuthenticated, async (req, res) => {
    try {        

        let query = {}; // Default: Admins & Students see all announcements

        if (req.user.role === "lecturer") {
            query.email = req.user.email.toLowerCase();         }

        const announcements = await Announcement.find(query).lean();       
        
        const formattedAnnouncements = announcements.map((announcement) => ({
            ...announcement,
            date: announcement.date ? new Date(announcement.date).toISOString().split('T')[0] : null,
        }));        
        return res.status(200).json({ announcements: formattedAnnouncements });

    } catch (error) {
        console.error(" Error fetching announcements:", error);
        return res.status(500).json({ message: "Server error" });
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
app.get('/materials', isAuthenticated, authorizeRoles("Super-admin", "admin", "lecturer", "student"), async (req, res) => {
    try {
        const { search, recent } = req.query;

        if (search && typeof search !== 'string') {
            return res.status(400).json({ message: 'Search term must be a string' });
        }

        let query = search
            ? {
                $or: [
                    { unit: { $regex: search, $options: 'i' } },
                    { name: { $regex: search, $options: 'i' } },
                ],
            }
            : {};

        
        if (req.user.role === "lecturer") {
            query.email = req.user.email;
           
        }

        const sort = recent === 'true' ? { uploadDate: -1 } : {};
        const materials = await Material.find(query).sort(sort);       
        res.status(200).json(materials);
    } catch (error) {
        console.error(" Error fetching materials:", error);
        res.status(500).json({ message: "Server error" });
    }
});




// Fetch individual notes for a unit
app.get('/notes/:unitName', isAuthenticated, async (req, res) => {
    try {
        const { unitName } = req.params;        

        const materials = await Material.find({ unit: unitName });

        if (!materials || materials.length === 0) {
            return res.status(404).json({ message: 'No notes found for this unit.' });
        }

        res.status(200).json(materials);
    } catch (error) {
        console.error(' Server Error:', error);
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
    const {unit, email, comments} = req.body
    let errors= [];
    
    if(!unit || !comments || !email ) {
        errors.push({msg:'please enter all fields'});
    }
    if (errors.length > 0) {
        return res.status(400).json({errors})
    }
    try {      
        const Comments = new Comment({
            unit,
            email,
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
        const { role, email } = req.user; // Get user role and email from authentication middleware

        let comments;
        if (role === 'student') {
            // Students can only see their own comments
            comments = await Comment.find({ email });
        } else if (['lecturer', 'admin', 'Super-admin'].includes(role)) {
            // Lecturer, Admin, and Super-admin can see all comments
            comments = await Comment.find();
        } else {
            return res.status(403).json({ error: "Access denied" });
        }

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
      console.error(`Student with email ${email} not found`);
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if school is missing
    if (!student.school) {
      console.error(`Student ${email} does not have a school assigned`);
    }

    // Update details
    student.registrationNumber = registrationNumber;
    student.course = course;
    student.school = school;

    await student.save(); // Save changes

    // Send email to super admin and admins
    const admins = await User.find({ role: { $in: ['superadmin', 'admin'] } });  // Fetch users with role 'admin' or 'superadmin'

    const adminEmails = admins.map(admin => admin.email);  // Extract admin emails

    const mailOptions = {
      from: process.env.SMTP_USER,  // Your email
      to: adminEmails,  // Array of admin emails
      subject: 'New Student Enrollment',
      text: `A student has been successfully enrolled.\n\nName: ${student.name}\nEmail: ${email}\nRegistration Number: ${registrationNumber}\nCourse: ${course}\nSchool: ${school}\n\nPlease review the student details.`,
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: 'Student enrolled successfully and notification sent to admins', student });

  } catch (error) {
    console.error('Error enrolling student:', error);
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
