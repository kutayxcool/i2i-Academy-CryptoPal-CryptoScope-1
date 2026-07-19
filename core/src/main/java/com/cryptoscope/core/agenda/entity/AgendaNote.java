package com.cryptoscope.core.agenda.entity;

import com.cryptoscope.core.user.entity.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(
        name = "agenda_notes",
        indexes = {
                @Index(
                        name = "idx_agenda_notes_user_date",
                        columnList = "user_id, note_date"
                ),
                @Index(
                        name = "idx_agenda_notes_user_created",
                        columnList = "user_id, created_at"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
public class AgendaNote {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "user_id",
            nullable = false
    )
    private User user;

    @Column(
            name = "note_date",
            nullable = false
    )
    private LocalDate noteDate;

    @Column(
            nullable = false,
            length = 120
    )
    private String title;

    @Column(
            nullable = false,
            columnDefinition = "TEXT"
    )
    private String content;

    @Column(
            name = "created_at",
            nullable = false,
            updatable = false
    )
    private Instant createdAt;

    @Column(
            name = "updated_at",
            nullable = false
    )
    private Instant updatedAt;

    public AgendaNote(
            User user,
            LocalDate noteDate,
            String title,
            String content
    ) {
        this.user = user;
        this.noteDate = noteDate;
        this.title = title;
        this.content = content;
    }

    @PrePersist
    public void prePersist() {
        Instant now = Instant.now();

        if (createdAt == null) {
            createdAt = now;
        }

        updatedAt = now;
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = Instant.now();
    }
}