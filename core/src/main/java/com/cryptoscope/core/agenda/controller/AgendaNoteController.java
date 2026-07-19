package com.cryptoscope.core.agenda.controller;

import com.cryptoscope.core.agenda.dto.AgendaNoteRequest;
import com.cryptoscope.core.agenda.dto.AgendaNoteResponse;
import com.cryptoscope.core.agenda.service.AgendaNoteService;
import com.cryptoscope.core.config.OpenApiConfig;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/agenda/notes")
@Tag(
        name = "Agenda",
        description = "Private daily agenda note operations"
)
@SecurityRequirement(
        name = OpenApiConfig.BEARER_AUTH
)
public class AgendaNoteController {

    private final AgendaNoteService agendaNoteService;

    public AgendaNoteController(
            AgendaNoteService agendaNoteService
    ) {
        this.agendaNoteService = agendaNoteService;
    }

    @Operation(
            summary = "Create an agenda note",
            description = """
                    Creates a private agenda note for
                    the authenticated user.
                    """
    )
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AgendaNoteResponse createNote(
            @Valid
            @RequestBody
            AgendaNoteRequest request
    ) {
        return agendaNoteService
                .createNote(request);
    }

    @Operation(
            summary = "Get agenda notes",
            description = """
                    Returns the authenticated user's
                    agenda notes within a date range.
                    """
    )
    @GetMapping
    public List<AgendaNoteResponse> getNotes(
            @RequestParam
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE
            )
            LocalDate startDate,

            @RequestParam
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE
            )
            LocalDate endDate
    ) {
        return agendaNoteService.getNotes(
                startDate,
                endDate
        );
    }

    @Operation(
            summary = "Update an agenda note",
            description = """
                    Updates an agenda note owned by
                    the authenticated user.
                    """
    )
    @PutMapping("/{noteId}")
    public AgendaNoteResponse updateNote(
            @PathVariable
            UUID noteId,

            @Valid
            @RequestBody
            AgendaNoteRequest request
    ) {
        return agendaNoteService.updateNote(
                noteId,
                request
        );
    }

    @Operation(
            summary = "Delete an agenda note",
            description = """
                    Deletes an agenda note owned by
                    the authenticated user.
                    """
    )
    @DeleteMapping("/{noteId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteNote(
            @PathVariable
            UUID noteId
    ) {
        agendaNoteService.deleteNote(
                noteId
        );
    }
}