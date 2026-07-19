package com.cryptoscope.core.agenda.service;

import com.cryptoscope.core.agenda.dto.AgendaNoteRequest;
import com.cryptoscope.core.agenda.dto.AgendaNoteResponse;
import com.cryptoscope.core.agenda.entity.AgendaNote;
import com.cryptoscope.core.agenda.repository.AgendaNoteRepository;
import com.cryptoscope.core.auth.security.CurrentUserProvider;
import com.cryptoscope.core.common.exception.UserNotFoundException;
import com.cryptoscope.core.user.entity.User;
import com.cryptoscope.core.user.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
public class AgendaNoteService {

    private static final long MAXIMUM_DATE_RANGE_DAYS = 366;

    private final AgendaNoteRepository agendaNoteRepository;
    private final UserRepository userRepository;
    private final CurrentUserProvider currentUserProvider;

    public AgendaNoteService(
            AgendaNoteRepository agendaNoteRepository,
            UserRepository userRepository,
            CurrentUserProvider currentUserProvider
    ) {
        this.agendaNoteRepository = agendaNoteRepository;
        this.userRepository = userRepository;
        this.currentUserProvider = currentUserProvider;
    }

    @Transactional
    public AgendaNoteResponse createNote(
            AgendaNoteRequest request
    ) {
        UUID userId =
                currentUserProvider.getCurrentUserId();

        User user = userRepository
                .findById(userId)
                .orElseThrow(
                        UserNotFoundException::new
                );

        AgendaNote agendaNote =
                new AgendaNote(
                        user,
                        request.noteDate(),
                        normalizeTitle(
                                request.title()
                        ),
                        normalizeContent(
                                request.content()
                        )
                );

        AgendaNote savedNote =
                agendaNoteRepository.save(
                        agendaNote
                );

        return toResponse(savedNote);
    }

    @Transactional(readOnly = true)
    public List<AgendaNoteResponse> getNotes(
            LocalDate startDate,
            LocalDate endDate
    ) {
        validateDateRange(
                startDate,
                endDate
        );

        UUID userId =
                currentUserProvider.getCurrentUserId();

        return agendaNoteRepository
                .findAllByUserIdAndNoteDateBetweenOrderByNoteDateAscCreatedAtAsc(
                        userId,
                        startDate,
                        endDate
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public AgendaNoteResponse updateNote(
            UUID noteId,
            AgendaNoteRequest request
    ) {
        UUID userId =
                currentUserProvider.getCurrentUserId();

        AgendaNote agendaNote =
                findOwnedNote(
                        noteId,
                        userId
                );

        agendaNote.setNoteDate(
                request.noteDate()
        );

        agendaNote.setTitle(
                normalizeTitle(
                        request.title()
                )
        );

        agendaNote.setContent(
                normalizeContent(
                        request.content()
                )
        );

        AgendaNote updatedNote =
                agendaNoteRepository.save(
                        agendaNote
                );

        return toResponse(updatedNote);
    }

    @Transactional
    public void deleteNote(
            UUID noteId
    ) {
        UUID userId =
                currentUserProvider.getCurrentUserId();

        AgendaNote agendaNote =
                findOwnedNote(
                        noteId,
                        userId
                );

        agendaNoteRepository.delete(
                agendaNote
        );
    }

    private AgendaNote findOwnedNote(
            UUID noteId,
            UUID userId
    ) {
        return agendaNoteRepository
                .findByIdAndUserId(
                        noteId,
                        userId
                )
                .orElseThrow(
                        () -> new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Agenda note was not found"
                        )
                );
    }

    private void validateDateRange(
            LocalDate startDate,
            LocalDate endDate
    ) {
        if (
                startDate == null
                        || endDate == null
        ) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Start date and end date are required"
            );
        }

        if (endDate.isBefore(startDate)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "End date must not be before start date"
            );
        }

        long dateRange =
                ChronoUnit.DAYS.between(
                        startDate,
                        endDate
                );

        if (
                dateRange
                        > MAXIMUM_DATE_RANGE_DAYS
        ) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Agenda date range must not exceed 366 days"
            );
        }
    }

    private String normalizeTitle(
            String title
    ) {
        return title.trim();
    }

    private String normalizeContent(
            String content
    ) {
        return content.trim();
    }

    private AgendaNoteResponse toResponse(
            AgendaNote agendaNote
    ) {
        return new AgendaNoteResponse(
                agendaNote.getId(),
                agendaNote.getNoteDate(),
                agendaNote.getTitle(),
                agendaNote.getContent(),
                agendaNote.getCreatedAt(),
                agendaNote.getUpdatedAt()
        );
    }
}