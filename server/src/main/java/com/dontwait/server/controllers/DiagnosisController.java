package com.dontwait.server.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/diagnosis")   
public class DiagnosisController {
    
    @GetMapping
    ResponseEntity<String> getDiagnosis() {
        return ResponseEntity.ok("Diagnosis data");
    }
}
