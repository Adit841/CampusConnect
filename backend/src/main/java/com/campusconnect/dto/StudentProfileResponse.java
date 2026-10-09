package com.campusconnect.dto;

import com.campusconnect.entity.StudentProfile;

public class StudentProfileResponse {

    private Long id;
    private String enrollmentNo;
    private String rollNo;
    private String course;
    private String department;
    private Integer year;
    private String section;

    public StudentProfileResponse() {
    }

    public StudentProfileResponse(Long id, String enrollmentNo, String rollNo, String course, String department, Integer year, String section) {
        this.id = id;
        this.enrollmentNo = enrollmentNo;
        this.rollNo = rollNo;
        this.course = course;
        this.department = department;
        this.year = year;
        this.section = section;
    }

    public static StudentProfileResponse fromEntity(StudentProfile profile) {
        if (profile == null) {
            return null;
        }
        return new StudentProfileResponse(
                profile.getId(),
                profile.getEnrollmentNo(),
                profile.getRollNo(),
                profile.getCourse(),
                profile.getDepartment(),
                profile.getYear(),
                profile.getSection()
        );
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEnrollmentNo() {
        return enrollmentNo;
    }

    public void setEnrollmentNo(String enrollmentNo) {
        this.enrollmentNo = enrollmentNo;
    }

    public String getRollNo() {
        return rollNo;
    }

    public void setRollNo(String rollNo) {
        this.rollNo = rollNo;
    }

    public String getCourse() {
        return course;
    }

    public void setCourse(String course) {
        this.course = course;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public Integer getYear() {
        return year;
    }

    public void setYear(Integer year) {
        this.year = year;
    }

    public String getSection() {
        return section;
    }

    public void setSection(String section) {
        this.section = section;
    }
}
