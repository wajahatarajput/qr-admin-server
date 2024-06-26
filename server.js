const express = require('express');
const mongoose = require('mongoose'); //
const bodyParser = require('body-parser'); // request json handle
const http = require('http');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const socketIo = require('socket.io'); // real time data streaming 
const { User, Student, Teacher, Course, Session } = require('./schemas');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/bnb_attendance_system', { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log("Connected to MongoDB");
});

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(bodyParser.json());
app.use(cors());

// REST APIs

// Create user //admin
app.post('/api/users', async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.status(201).send(user);
    } catch (error) {
        console.error(error);
        res.status(200).send({ message: "Internal Server Error" });
    }
});

// Get users
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find();

        res.status(200).send(users);
    } catch (error) {
        console.error(error);
        res.status(200).send({ message: "Internal Server Error" });
    }
});

// Get user by ID
app.get('/api/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);

        if (!user) {
            return res.status(200).send({ message: 'User not found' });
        }

        res.status(200).send(user);
    } catch (error) {
        console.error(error);
        res.status(200).send({ message: "Internal Server Error" });
    }
});

// Update user by ID
app.put('/api/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const user = await User.findByIdAndUpdate(id, updates, { new: true });

        if (!user) {
            return res.status(200).send({ message: 'User not found' });
        }

        res.status(200).send(user);
    } catch (error) {
        console.error(error);
        res.status(200).send({ message: "Internal Server Error" });
    }
});

// Delete user by ID
app.delete('/api/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByIdAndDelete(id);

        if (!user) {
            return res.status(200).send({ message: 'User not found' });
        }

        res.status(200).send({ message: 'User deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(200).send({ message: "Internal Server Error" });
    }
});

// Login user
app.post('/api/login', async (req, res) => {
    try {
        const { username, password, role } = req.body;
        const user = await User.findOne({ username, password, role });

        if (!user) {
            return res.status(401).json({ message: "Invalid username or password or you must not have access to this app contact the admin" });
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, 'bnb_aatika');

        res.status(200).json({ token, id: user?._id });
    } catch (error) {
        console.error(error);
        res.status(200).json({ message: "Server Error" });
    }
});

// Get students
app.get('/api/students', async (req, res) => {
    try {
        const students = await Student.find().populate('user');
        res.status(200).send(students);
    } catch (error) {
        res.status(200).send(error);
    }
});

// Get student by ID
app.get('/api/students/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Find the student
        const student = await Student.findById(id).populate('user');

        if (!student) {
            return res.status(200).send({ message: 'Student not found' });
        }
        res.send(student);
    } catch (error) {
        res.status(200).send(error);
    }
});

// Create student
app.post('/api/students', async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        const studentObject = {
            user: user._id,
            courses: []
        }
        const student = new Student(studentObject);
        await student.save();
        res.status(201).send(student);
    } catch (error) {
        res.status(200).send(error);
    }
});

// Update student by ID
app.put('/api/students/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        // Find the student
        const student = await Student.findById(id);
        const user = student.user;

        // Update the user information
        await User.findByIdAndUpdate(user._id, {
            username: updates.username,
            password: updates.password,
            first_name: updates.first_name,
            last_name: updates.last_name
        });

        // Update the student information
        const options = { new: true }; // To return the updated document
        const updatedStudent = await Student.findByIdAndUpdate(id, updates, options);

        if (!updatedStudent) {
            return res.status(200).send({ message: 'Student not found' });
        }

        res.send(updatedStudent);
    } catch (error) {
        res.status(200).send(error);
    }
});

// Delete student by ID
app.delete('/api/students/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Find the student and delete it
        const student = await Student.findByIdAndDelete(id)

        if (!student) {
            return res.status(200).send({ message: 'Student not found' });
        }

        console.log(student)

        // Find the user associated with the student
        const user = await User.findOneAndDelete(student.user);

        if (!user) {
            return res.status(200).send({ message: 'User not found' });
        }

        res.send({ message: 'Student and associated user deleted successfully' });
    } catch (error) {
        res.status(200).send(error);
    }
});

// Get teachers
app.get('/api/teachers', async (req, res) => {
    try {
        const teachers = await Teacher.find().populate('user');
        res.status(200).send(teachers);
    } catch (error) {
        res.status(200).send(error);
    }
});

// Get teacher by ID
app.get('/api/teachers/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Find the teacher
        const teacher = await Teacher.findById(id).populate('user');

        if (!teacher) {
            return res.status(200).send({ message: 'Teacher not found' });
        }
        res.send(teacher);
    } catch (error) {
        res.status(200).send(error);
    }
});

// Create teacher
app.post('/api/teachers', async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        const teacherObject = {
            user: user._id,
            courses: []
        }
        const teacher = new Teacher(teacherObject);
        await teacher.save();
        res.status(201).send(teacher);
    } catch (error) {
        res.status(200).send(error);
    }
});

// Update teacher by ID
app.put('/api/teachers/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        // Find the teacher
        const teacher = await Teacher.findById(id);
        const user = teacher.user;

        // Update the user information
        await User.findByIdAndUpdate(user._id, {
            username: updates.username,
            password: updates.password,
            first_name: updates.first_name,
            last_name: updates.last_name
        });

        // Update the teacher information
        const options = { new: true }; // To return the updated document
        const updatedTeacher = await Teacher.findByIdAndUpdate(id, updates, options);

        if (!updatedTeacher) {
            return res.status(200).send({ message: 'Teacher not found' });
        }

        res.send(updatedTeacher);
    } catch (error) {
        res.status(200).send(error);
    }
});

// Delete teacher by ID
app.delete('/api/teachers/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Find the teacher and delete it
        const teacher = await Teacher.findByIdAndDelete(id)

        if (!teacher) {
            return res.status(200).send({ message: 'Teacher not found' });
        }

        // Find the user associated with the teacher
        const user = await User.findOneAndDelete(teacher.user);

        if (!user) {
            return res.status(200).send({ message: 'User not found' });
        }

        res.send({ message: 'Teacher and associated user deleted successfully' });
    } catch (error) {
        res.status(200).send(error);
    }
});

// Get courses
app.get('/api/courses', async (req, res) => {
    try {
        const courses = await Course.find();
        res.status(200).send(courses);
    } catch (error) {
        res.status(200).send(error);
    }
});

// Get course by ID
app.get('/api/courses/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Find the course
        const course = await Course.findById(id);

        if (!course) {
            return res.status(200).send({ message: 'Course not found' });
        }
        res.send(course);
    } catch (error) {
        res.status(200).send(error);
    }
});

// Create course
app.post('/api/courses', async (req, res) => {
    try {
        const course = new Course(req.body);
        await course.save();
        res.status(201).send(course);
    } catch (error) {
        res.status(200).send(error);
    }
});

// Update course by ID
app.put('/api/courses/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Update the course information
        const options = { new: true }; // To return the updated document
        const updatedCourse = await Course.findByIdAndUpdate(id, updates, options);

        if (!updatedCourse) {
            return res.status(200).send({ message: 'Course not found' });
        }

        res.send(updatedCourse);
    } catch (error) {
        res.status(200).send(error);
    }
});

// Delete course by ID
app.delete('/api/courses/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Find the course and delete it
        const course = await Course.findByIdAndDelete(id);

        if (!course) {
            return res.status(200).send({ message: 'Course not found' });
        }

        res.send({ message: 'Course deleted successfully' });
    } catch (error) {
        res.status(200).send(error);
    }
});

// Create session
app.post('/api/sessions', async (req, res) => {
    try {
        const session = new Session(req.body);
        await session.save();
        res.status(201).send(session);
    } catch (error) {
        res.status(200).send(error);
    }
});


// ----------------------------------------------------

// POST route to assign a course to a teacher
app.post('/assigncourse/:teacherId/:courseId', async (req, res) => {
    const { teacherId, courseId } = req.params;

    try {
        // Check if teacher exists
        const teacher = await Teacher.findById(teacherId);
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        // Check if course exists
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Add course to teacher's courses array
        teacher.courses.push(courseId);
        await teacher.save();

        res.json({ message: 'Course assigned to teacher successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// POST request to register a student in a course
app.post('/registercourse/:userId/:course_code', async (req, res) => {
    const { userId, course_code } = req.params;
    try {
        // Check if student and course exist
        const user = await User.findById(userId);
        const student = await Student.find({ user });
        const course = await Course.find({ course_code });

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        // Check if the student is already enrolled in the course
        if (course[0]?.students?.includes(student[0]?._id)) {
            return res.status(400).json({ message: "Student is already enrolled in this course" });
        }

        // Update student's courses array with the new course
        student[0].courses.push(course[0]?._id);
        await student[0].save();

        // Update course's students array with the new student
        course[0].students.push(student[0]?._id);
        await course[0].save();

        res.status(200).json({ message: "Student registered in the course successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Socket setup for real-time attendance updates
io.on('connection', socket => {
    console.log('New client connected');

    socket.on('markAttendance', async data => {
        try {
            // const attendance = new Attendance(data);
            // await attendance.save();
            // Emit socket event for attendance update
            // io.emit('attendanceUpdate', attendance);
        } catch (error) {
            console.error('Error marking attendance:', error);
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
