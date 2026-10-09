package com.campusconnect.dto;

import com.campusconnect.entity.TeacherProfile;

public class TeacherProfileResponse {

    private Long id;
    private String employeeId;
    private String department;
    private String designation;
    private String officeRoom;

    public TeacherProfileResponse() {
    }

    public TeacherProfileResponse(Long id, String employeeId, String department, String designation, String officeRoom) {
        this.id = id;
        this.employeeId = employeeId;
        this.department = department;
        this.designation = designation;
        this.officeRoom = officeRoom;
    }

    public static TeacherProfileResponse fromEntity(TeacherProfile profile) {
        if (profile == null) {
            return null;
        }
        return new TeacherProfileResponse(
                profile.getId(),
                profile.getEmployeeId(),
                profile.getDepartment(),
                profile.getDesignation(),
                profile.getOfficeRoom()
        );
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(String employeeId) {
        this.employeeId = employeeId;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getDesignation() {
        return designation;
    }

    public void setDesignation(String designation) {
        this.designation = designation;
    }

    public String getOfficeRoom() {
        return officeRoom;
    }

    public void setOfficeRoom(String officeRoom) {
        this.officeRoom = officeRoom;
    }
}
