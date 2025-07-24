package com.goalraiders.backend.dto;

public class ErrorResponse {
    private int status;
    private String code; // Unique error code
    private String message;
    private long timestamp;

    public ErrorResponse(int status, String code, String message, long timestamp) {
        this.status = status;
        this.code = code;
        this.message = message;
        this.timestamp = timestamp;
    }

    public int getStatus() {
        return status;
    }

    public void setStatus(int status) {
        this.status = status;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public long getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(long timestamp) {
        this.timestamp = timestamp;
    }
}