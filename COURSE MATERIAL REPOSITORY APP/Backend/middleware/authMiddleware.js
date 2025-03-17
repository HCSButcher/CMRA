const jwt = require("jsonwebtoken");

const isAuthenticated = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach user data to request
        next();
    } catch (error) {
        return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
};

const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {        
        const { email, role } = req.user;
        
        if (role === "Super-admin" || role === "admin") {
            return next();
        }
        
        if (role === "lecturer") {
            if (req.method === "GET") {
                if (req.user.email === email || req.query.role === "student" || req.params.role === "student") {                    
                    return next();
                }
            }            
            return res.status(403).json({ message: "Forbidden: Lecturers can only access their own & student GET requests" });
        }
        
        if (role === "student") {
            if (req.method === "GET" && (req.user.email === email || req.params.email === email)) {               
                return next();
            }           
            return res.status(403).json({ message: "Forbidden: Students can only access their own GET requests" });
        }
        
        return res.status(403).json({ message: "Forbidden: Unauthorized access" });
    };
};

module.exports = { isAuthenticated, authorizeRoles };
