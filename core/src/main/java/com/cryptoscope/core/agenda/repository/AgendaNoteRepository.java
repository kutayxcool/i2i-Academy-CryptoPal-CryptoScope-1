package com.cryptoscope.core.agenda.repository;

import com.cryptoscope.core.agenda.entity.AgendaNote;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AgendaNoteRepository
        extends JpaRepository<AgendaNote, UUID> {

    List<AgendaNote>
    findAllByUserIdAndNoteDateBetweenOrderByNoteDateAscCreatedAtAsc(
            UUID userId,
            LocalDate startDate,
            LocalDate endDate
    );

    Optional<AgendaNote> findByIdAndUserId(
            UUID noteId,
            UUID userId
    );
}