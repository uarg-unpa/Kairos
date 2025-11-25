package com.nextech.kairos.exception;

import java.time.Instant;

public class ApiError {
    public final Instant timestamp = Instant.now();
    public final int status;
    public final String error;
    public final String message;
    public final String path;

    public ApiError(int status, String error, String message, String path) {
        this.status = status;
        this.error = error;
        this.message = message;
        this.path = path;
    }
}

