const mongoose = require('mongoose');

// Define schema for user
const userSchema = new mongoose.Schema({
    username: { // cms-id
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['admin', 'student', 'teacher'],
        required: true
    },
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    }
});


// Define schema for student
const studentSchema = new mongoose.Schema({
    user: { // works as foreign key
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    courses: [{ // works as foreign key for course schema as can have multiple courses
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    }], // Array of courses a student is enrolled in

    joiningDate: {
        type: Date,
        required: true,
        default: Date.now
    },

    leavingDate: {
        type: Date,
        default: null
    },

    status: {
        type: String,
        enum: ['active', 'left', 'pass_out'],
        default: 'active'
    }
});


// Define schema for teacher
const teacherSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }] // Array of courses a teacher is teaching
    // (optional)
    // joining Date
    // leaving Date
    // status
});

// Define schema for course
const courseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    department: {
        type: String,
        required: true
    },
    course_code: {
        type: String,
        required: true
    },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }], // Array of students enrolled in the course
    sessions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Session' }] // Array of sessions associated with the course
});

// Define schema for session
const sessionSchema = new mongoose.Schema({
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
        required: true
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    geoLocations: {
        type: [String] // Array of geolocation
    },
    attendance: [{
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student'
        },
        isPresent: {
            type: Boolean,
            default: false
        }
    }]
    // Add more session fields as needed
    // session time
    // room number
});

// Create models based on the schemas
const User = mongoose.model('User', userSchema);
const Student = mongoose.model('Student', studentSchema);
const Teacher = mongoose.model('Teacher', teacherSchema);
const Course = mongoose.model('Course', courseSchema);
const Session = mongoose.model('Session', sessionSchema);

module.exports = {
    User,
    Student,
    Teacher,
    Course,
    Session
};
