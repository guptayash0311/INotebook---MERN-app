const express = require('express');
const User = require('../models/User');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchUser=require('../middleware/fetchUser')

const JWT_SECRET = 'VerifiedByYash';
// ROUTE 1 : Create a user using post "api/auth/createuser",No login required
router.post('/createuser', [
    body('name', 'Enter a valid name').isLength({ min: 3 }),
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password must be of atleast 5 characters').isLength({ min: 5 })
], async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({success, errors: errors.array() });
    }
    try {


        let user = await User.findOne({ email: req.body.email });
        if (user) {
            return res.status(400).json({success, error: "User with this email already exits!" })
        }
        const salt = await bcrypt.genSalt(10);
        secPass = await bcrypt.hash(req.body.password, salt);
        user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: secPass
        });
        const data = {
            user: {
                id: user.id
            }
        }
        const authtoken = jwt.sign(data, JWT_SECRET);
        // res.json(user)
        success=true;
        res.json({success, authtoken })
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error occured!");
    }
})


//ROUTE 2 : Authenticate the user using "api/auth/login", No login required
router.post('/login', [
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password cannot be blank').exists()
], async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({success, errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({success, error: "Please try to login with proper credentials" });
        }

        const passwordcompare = await bcrypt.compare(password, user.password);
        if (!passwordcompare) {
            return res.status(400).json({success, error: "Please try to login with proper credentials" });
        }
        const data = {
            user: {
                id: user.id
            }
        }
        const authtoken = jwt.sign(data, JWT_SECRET);
        success=true;
        res.json({success, authtoken })

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error occured!");

    }
})

//ROUTE 3 : Get loggedin user details using "api/auth/getuser", Login required
router.post('/getuser',fetchUser, async (req, res) => {
try {
    userId=req.user.id;
    const user = await User.findById(userId).select("-password")
    res.send(user);

} catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error occured!");

}
})
module.exports = router