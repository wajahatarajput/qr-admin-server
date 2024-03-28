const express = require('express');
const mongoose = require('mongoose'); //
const bodyParser = require('body-parser'); // request json handle
const http = require('http');
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

// Create user
app.post('/api/users', async (req, res) => {
    try {
        console.log(req.body)
        const user = new User(req.body);
        await user.save();
        res.status(201).send(user);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Login user
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username, password });
        if (!user) {
            return res.status(200).json({ userExist: false });
        }

        res.json({ userExist: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

// Create student
app.post('/api/students', async (req, res) => {
    try {
        const student = new Student(req.body);
        await student.save();
        res.status(201).send(student);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Update student by ID
app.put('/api/students/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const options = { new: true }; // To return the updated document

        // Find and update the student
        const student = await Student.findByIdAndUpdate(id, updates, options);

        if (!student) {
            return res.status(404).send({ message: 'Student not found' });
        }

        res.send(student);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Delete student by ID
app.delete('/api/students/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Find and delete the student
        const student = await Student.findByIdAndDelete(id);

        if (!student) {
            return res.status(404).send({ message: 'Student not found' });
        }

        res.send({ message: 'Student deleted successfully' });
    } catch (error) {
        res.status(400).send(error);
    }
});

// Create teacher
app.post('/api/teachers', async (req, res) => {
    try {
        const teacher = new Teacher(req.body);
        await teacher.save();
        res.status(201).send(teacher);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Create course
app.post('/api/courses', async (req, res) => {
    try {
        const course = new Course(req.body);
        await course.save();
        res.status(201).send(course);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Create session
app.post('/api/sessions', async (req, res) => {
    try {
        const session = new Session(req.body);
        await session.save();
        res.status(201).send(session);
    } catch (error) {
        res.status(400).send(error);
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
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
