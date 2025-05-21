// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// EduChain - Decentralized E-Learning Platform
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract EduChain is Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _courseIds;
    Counters.Counter private _certificateIds;

    struct Course {
        uint256 id;
        address teacher;
        string title;
        string description;
        uint256 price;
        string contentUrl;
        uint256 moduleCount;
    }

    struct StudentProgress {
        bool isEnrolled;
        mapping(uint256 => bool) completedModules;
        uint256 completedModuleCount;
        bool coursePassed;
    }

    struct Certificate {
        uint256 id;
        address student;
        uint256 courseId;
        uint256 timestamp;
        bool issued;
    }

    // Mappings
    mapping(uint256 => Course) public courses;
    mapping(uint256 => mapping(address => StudentProgress)) public studentProgress;
    mapping(uint256 => Certificate) public certificates;
    mapping(address => uint256[]) public teacherCourses;
    mapping(address => uint256[]) public studentCourses;
    mapping(address => uint256[]) public studentCertificates;

    // Events
    event CourseCreated(uint256 courseId, address teacher, string title, uint256 price);
    event CourseEnrollment(uint256 courseId, address student);
    event ModuleCompleted(uint256 courseId, address student, uint256 moduleIndex);
    event CourseCompleted(uint256 courseId, address student);
    event CertificateIssued(uint256 certificateId, address student, uint256 courseId, uint256 timestamp);

    // Modifiers
    modifier onlyTeacher(uint256 _courseId) {
        require(courses[_courseId].teacher == msg.sender, "Only the teacher can perform this action");
        _;
    }

    modifier onlyEnrolledStudent(uint256 _courseId) {
        require(studentProgress[_courseId][msg.sender].isEnrolled, "Only enrolled students can perform this action");
        _;
    }

    // Course Management Functions
    function createCourse(
        string memory _title,
        string memory _description,
        uint256 _price,
        string memory _contentUrl,
        uint256 _moduleCount
    ) public returns (uint256) {
        require(_moduleCount > 0, "Course must have at least one module");

        _courseIds.increment();
        uint256 newCourseId = _courseIds.current();

        Course storage newCourse = courses[newCourseId];
        newCourse.id = newCourseId;
        newCourse.teacher = msg.sender;
        newCourse.title = _title;
        newCourse.description = _description;
        newCourse.price = _price;
        newCourse.contentUrl = _contentUrl;
        newCourse.moduleCount = _moduleCount;

        teacherCourses[msg.sender].push(newCourseId);

        emit CourseCreated(newCourseId, msg.sender, _title, _price);
        return newCourseId;
    }

    function enrollInCourse(uint256 _courseId) public payable {
        Course storage course = courses[_courseId];
        require(course.id == _courseId, "Course does not exist");
        require(msg.value >= course.price, "Insufficient payment");
        require(!studentProgress[_courseId][msg.sender].isEnrolled, "Already enrolled");

        // Initialize the student progress
        StudentProgress storage progress = studentProgress[_courseId][msg.sender];
        progress.isEnrolled = true;
        progress.completedModuleCount = 0;
        progress.coursePassed = false;

        // Send payment to the teacher
        payable(course.teacher).transfer(msg.value);

        // Add course to student's courses
        studentCourses[msg.sender].push(_courseId);

        emit CourseEnrollment(_courseId, msg.sender);
    }

    // Module Completion Functions
    function completeModule(uint256 _courseId, uint256 _moduleIndex) public onlyEnrolledStudent(_courseId) {
        Course storage course = courses[_courseId];
        require(_moduleIndex < course.moduleCount, "Invalid module index");
        
        StudentProgress storage progress = studentProgress[_courseId][msg.sender];
        require(!progress.completedModules[_moduleIndex], "Module already completed");

        progress.completedModules[_moduleIndex] = true;
        progress.completedModuleCount++;

        emit ModuleCompleted(_courseId, msg.sender, _moduleIndex);

        // Check if all modules are completed
        if (progress.completedModuleCount == course.moduleCount) {
            progress.coursePassed = true;
            emit CourseCompleted(_courseId, msg.sender);
        }
    }

    // Certificate Functions
    function issueCertificate(uint256 _courseId) public onlyEnrolledStudent(_courseId) {
        StudentProgress storage progress = studentProgress[_courseId][msg.sender];
        require(progress.coursePassed, "Course not completed yet");
        
        // Check if student already has a certificate for this course
        for (uint256 i = 0; i < studentCertificates[msg.sender].length; i++) {
            uint256 certId = studentCertificates[msg.sender][i];
            if (certificates[certId].courseId == _courseId) {
                revert("Certificate already issued");
            }
        }

        _certificateIds.increment();
        uint256 newCertificateId = _certificateIds.current();

        certificates[newCertificateId] = Certificate({
            id: newCertificateId,
            student: msg.sender,
            courseId: _courseId,
            timestamp: block.timestamp,
            issued: true
        });

        studentCertificates[msg.sender].push(newCertificateId);

        emit CertificateIssued(newCertificateId, msg.sender, _courseId, block.timestamp);
    }

    // Getter Functions
    function getCourseCount() public view returns (uint256) {
        return _courseIds.current();
    }

    function getTeacherCourses(address _teacher) public view returns (uint256[] memory) {
        return teacherCourses[_teacher];
    }

    function getStudentCourses(address _student) public view returns (uint256[] memory) {
        return studentCourses[_student];
    }

    function getStudentCertificates(address _student) public view returns (uint256[] memory) {
        return studentCertificates[_student];
    }

    function getStudentProgress(uint256 _courseId, address _student) public view returns (bool isEnrolled, uint256 completedModules, bool coursePassed) {
        StudentProgress storage progress = studentProgress[_courseId][_student];
        return (progress.isEnrolled, progress.completedModuleCount, progress.coursePassed);
    }

    function verifyCertificate(uint256 _certificateId, address _student, uint256 _courseId) public view returns (bool) {
        Certificate storage cert = certificates[_certificateId];
        return (cert.issued && cert.student == _student && cert.courseId == _courseId);
    }
} 