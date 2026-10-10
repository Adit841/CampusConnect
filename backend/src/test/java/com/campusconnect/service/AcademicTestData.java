package com.campusconnect.service;

import java.time.Instant;

import com.campusconnect.entity.Assignment;
import com.campusconnect.entity.AssignmentStatus;
import com.campusconnect.entity.Role;
import com.campusconnect.entity.StudentProfile;
import com.campusconnect.entity.Subject;
import com.campusconnect.entity.Submission;
import com.campusconnect.entity.SubmissionStatus;
import com.campusconnect.entity.User;

final class AcademicTestData {

    static final Instant NOW = Instant.parse("2026-10-10T10:00:00Z");

    private AcademicTestData() {
    }

    static User user(long id, String name, String email, Role role) {
        User user = new User(name, email, "pass", role);
        user.setId(id);
        return user;
    }

    static StudentProfile profile(User student, String department, String course, Integer year, String section) {
        StudentProfile profile = new StudentProfile(student, "ENR-" + student.getId(), "R" + student.getId(), course, department, year, section);
        profile.setId(student.getId() + 1000);
        return profile;
    }

    static Subject subject(long id, User teacher, String department) {
        Subject subject = new Subject();
        subject.setId(id);
        subject.setName("Subject " + id);
        subject.setCode("SUB-" + id);
        subject.setDepartment(department);
        subject.setTeacher(teacher);
        subject.setCreatedAt(NOW);
        subject.setUpdatedAt(NOW);
        return subject;
    }

    static Assignment assignment(long id, Subject subject, AssignmentStatus status, Instant dueAt) {
        Assignment assignment = new Assignment();
        assignment.setId(id);
        assignment.setSubject(subject);
        assignment.setCreatedBy(subject.getTeacher());
        assignment.setTitle("Assignment " + id);
        assignment.setMaxMarks(50);
        assignment.setStatus(status);
        assignment.setDueAt(dueAt);
        assignment.setCreatedAt(NOW.minusSeconds(86400));
        assignment.setUpdatedAt(NOW.minusSeconds(86400));
        if (status == AssignmentStatus.PUBLISHED) {
            assignment.setPublishedAt(NOW.minusSeconds(3600));
        }
        return assignment;
    }

    static Submission submission(long id, Assignment assignment, User student, SubmissionStatus status) {
        Submission submission = new Submission();
        submission.setId(id);
        submission.setAssignment(assignment);
        submission.setStudent(student);
        submission.setTextResponse("My answer");
        submission.setStatus(status);
        submission.setSubmittedAt(NOW.minusSeconds(600));
        return submission;
    }
}
