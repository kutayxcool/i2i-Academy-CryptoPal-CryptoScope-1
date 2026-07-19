import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import Navbar from "../components/Navbar";

import {
    createAgendaNote,
    deleteAgendaNote,
    getAgendaNotes,
    updateAgendaNote,
} from "../services/agendaService";

import "../styles/Agenda.css";

const WEEK_DAYS = [
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
    "Sun",
];

function getApiErrorMessage(
    requestError,
    fallbackMessage
) {
    return requestError.response?.data
        ?.error?.message
        || requestError.response?.data?.message
        || requestError.message
        || fallbackMessage;
}

function createMonthDate(date) {
    return new Date(
        date.getFullYear(),
        date.getMonth(),
        1
    );
}

function createDateKey(date) {
    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function parseDateKey(dateKey) {
    const [
        year,
        month,
        day,
    ] = dateKey
        .split("-")
        .map(Number);

    return new Date(
        year,
        month - 1,
        day
    );
}

function isSameMonth(
    firstDate,
    secondDate
) {
    return (
        firstDate.getFullYear()
        === secondDate.getFullYear()
        && firstDate.getMonth()
        === secondDate.getMonth()
    );
}

function createCalendarDays(
    visibleMonth
) {
    const firstDay =
        createMonthDate(
            visibleMonth
        );

    /*
     * JavaScript uses Sunday as day zero.
     * The calendar starts on Monday.
     */
    const mondayOffset =
        (
            firstDay.getDay()
            + 6
        ) % 7;

    const calendarStart =
        new Date(
            firstDay.getFullYear(),
            firstDay.getMonth(),
            firstDay.getDate()
            - mondayOffset
        );

    return Array.from(
        {
            length: 42,
        },
        (_, index) => {
            const date =
                new Date(calendarStart);

            date.setDate(
                calendarStart.getDate()
                + index
            );

            return date;
        }
    );
}

function formatMonthTitle(date) {
    return date.toLocaleDateString(
        "en-US",
        {
            month: "long",
            year: "numeric",
        }
    );
}

function formatSelectedDate(dateKey) {
    return parseDateKey(
        dateKey
    ).toLocaleDateString(
        "en-US",
        {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
        }
    );
}

function formatNoteTime(timestamp) {
    if (!timestamp) {
        return "Unknown time";
    }

    const date =
        new Date(timestamp);

    if (Number.isNaN(date.getTime())) {
        return "Unknown time";
    }

    return date.toLocaleTimeString(
        "en-US",
        {
            hour: "2-digit",
            minute: "2-digit",
        }
    );
}

function sortNotes(notes) {
    return [...notes].sort(
        (
            firstNote,
            secondNote
        ) => {
            const dateComparison =
                firstNote.noteDate
                    .localeCompare(
                        secondNote.noteDate
                    );

            if (dateComparison !== 0) {
                return dateComparison;
            }

            return new Date(
                secondNote.createdAt
            ).getTime()
                - new Date(
                    firstNote.createdAt
                ).getTime();
        }
    );
}

function CalendarArrow({
    direction,
}) {
    return (
        <svg
            viewBox="0 0 20 20"
            aria-hidden="true"
        >
            <path
                d={
                    direction === "left"
                        ? "M12.5 5L7.5 10L12.5 15"
                        : "M7.5 5L12.5 10L7.5 15"
                }
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
            />
        </svg>
    );
}

function AgendaPage() {
    const now =
        new Date();

    const todayKey =
        createDateKey(now);

    const [
        visibleMonth,
        setVisibleMonth,
    ] = useState(
        createMonthDate(now)
    );

    const [
        selectedDate,
        setSelectedDate,
    ] = useState(todayKey);

    const [
        notes,
        setNotes,
    ] = useState([]);

    const [
        isLoading,
        setIsLoading,
    ] = useState(true);

    const [
        isRefreshing,
        setIsRefreshing,
    ] = useState(false);

    const [
        isSaving,
        setIsSaving,
    ] = useState(false);

    const [
        deletingNoteId,
        setDeletingNoteId,
    ] = useState(null);

    const [
        error,
        setError,
    ] = useState("");

    const [
        successMessage,
        setSuccessMessage,
    ] = useState("");

    const [
        isFormOpen,
        setIsFormOpen,
    ] = useState(false);

    const [
        editingNoteId,
        setEditingNoteId,
    ] = useState(null);

    const [
        title,
        setTitle,
    ] = useState("");

    const [
        content,
        setContent,
    ] = useState("");

    const calendarDays =
        useMemo(
            () =>
                createCalendarDays(
                    visibleMonth
                ),
            [visibleMonth]
        );

    const rangeStart =
        createDateKey(
            calendarDays[0]
        );

    const rangeEnd =
        createDateKey(
            calendarDays[
                calendarDays.length - 1
            ]
        );

    const loadNotes =
        useCallback(
            async (
                showInitialLoading = false
            ) => {
                if (showInitialLoading) {
                    setIsLoading(true);
                } else {
                    setIsRefreshing(true);
                }

                setError("");

                try {
                    const response =
                        await getAgendaNotes(
                            rangeStart,
                            rangeEnd
                        );

                    setNotes(
                        Array.isArray(
                            response.data
                        )
                            ? sortNotes(
                                response.data
                            )
                            : []
                    );
                } catch (requestError) {
                    setError(
                        getApiErrorMessage(
                            requestError,
                            "Unable to load agenda notes"
                        )
                    );
                } finally {
                    setIsLoading(false);
                    setIsRefreshing(false);
                }
            },
            [
                rangeStart,
                rangeEnd,
            ]
        );

    useEffect(() => {
        const initialLoadTimer =
            window.setTimeout(
                () => {
                    void loadNotes(true);
                },
                0
            );

        return () => {
            window.clearTimeout(
                initialLoadTimer
            );
        };
    }, [loadNotes]);

    const notesByDate =
        useMemo(
            () => {
                const groupedNotes =
                    new Map();

                notes.forEach((note) => {
                    const currentNotes =
                        groupedNotes.get(
                            note.noteDate
                        ) || [];

                    currentNotes.push(note);

                    groupedNotes.set(
                        note.noteDate,
                        currentNotes
                    );
                });

                groupedNotes.forEach(
                    (
                        dayNotes,
                        dateKey
                    ) => {
                        groupedNotes.set(
                            dateKey,
                            sortNotes(
                                dayNotes
                            )
                        );
                    }
                );

                return groupedNotes;
            },
            [notes]
        );

    const selectedNotes =
        notesByDate.get(
            selectedDate
        ) || [];

    const visibleMonthNotes =
        useMemo(
            () =>
                notes.filter(
                    (note) =>
                        isSameMonth(
                            parseDateKey(
                                note.noteDate
                            ),
                            visibleMonth
                        )
                ),
            [
                notes,
                visibleMonth,
            ]
        );

    const activeDays =
        useMemo(
            () =>
                new Set(
                    visibleMonthNotes.map(
                        (note) =>
                            note.noteDate
                    )
                ).size,
            [visibleMonthNotes]
        );

    const closeForm = () => {
        setIsFormOpen(false);
        setEditingNoteId(null);
        setTitle("");
        setContent("");
    };

    const openCreateForm = () => {
        setError("");
        setSuccessMessage("");
        setEditingNoteId(null);
        setTitle("");
        setContent("");
        setIsFormOpen(true);
    };

    const openEditForm = (note) => {
        const noteDate =
            parseDateKey(
                note.noteDate
            );

        setSelectedDate(
            note.noteDate
        );

        setVisibleMonth(
            createMonthDate(
                noteDate
            )
        );

        setEditingNoteId(
            note.id
        );

        setTitle(
            note.title
        );

        setContent(
            note.content
        );

        setError("");
        setSuccessMessage("");
        setIsFormOpen(true);
    };

    const selectCalendarDay = (
        date
    ) => {
        const dateKey =
            createDateKey(date);

        setSelectedDate(dateKey);
        setError("");
        setSuccessMessage("");

        if (
            !isSameMonth(
                date,
                visibleMonth
            )
        ) {
            setVisibleMonth(
                createMonthDate(date)
            );
        }

        closeForm();
    };

    const moveMonth = (
        monthOffset
    ) => {
        const nextMonth =
            new Date(
                visibleMonth.getFullYear(),
                visibleMonth.getMonth()
                + monthOffset,
                1
            );

        const currentDate =
            new Date();

        const nextSelectedDate =
            isSameMonth(
                nextMonth,
                currentDate
            )
                ? currentDate
                : nextMonth;

        setVisibleMonth(nextMonth);

        setSelectedDate(
            createDateKey(
                nextSelectedDate
            )
        );

        setError("");
        setSuccessMessage("");
        closeForm();
    };

    const goToToday = () => {
        const currentDate =
            new Date();

        setVisibleMonth(
            createMonthDate(
                currentDate
            )
        );

        setSelectedDate(
            createDateKey(
                currentDate
            )
        );

        setError("");
        setSuccessMessage("");
        closeForm();
    };

    const handleSubmit = async (
        event
    ) => {
        event.preventDefault();

        const normalizedTitle =
            title.trim();

        const normalizedContent =
            content.trim();

        if (!normalizedTitle) {
            setError(
                "Note title must not be blank"
            );
            return;
        }

        if (!normalizedContent) {
            setError(
                "Note content must not be blank"
            );
            return;
        }

        if (
            normalizedTitle.length
            > 120
        ) {
            setError(
                "Note title must not exceed 120 characters"
            );
            return;
        }

        if (
            normalizedContent.length
            > 5000
        ) {
            setError(
                "Note content must not exceed 5000 characters"
            );
            return;
        }

        setIsSaving(true);
        setError("");
        setSuccessMessage("");

        const noteData = {
            noteDate:
                selectedDate,

            title:
                normalizedTitle,

            content:
                normalizedContent,
        };

        try {
            const response =
                editingNoteId
                    ? await updateAgendaNote(
                        editingNoteId,
                        noteData
                    )
                    : await createAgendaNote(
                        noteData
                    );

            const savedNote =
                response.data;

            setNotes(
                (currentNotes) =>
                    sortNotes([
                        ...currentNotes.filter(
                            (note) =>
                                note.id
                                !== savedNote.id
                        ),
                        savedNote,
                    ])
            );

            setSuccessMessage(
                editingNoteId
                    ? "Agenda note updated successfully"
                    : "Agenda note created successfully"
            );

            closeForm();
        } catch (requestError) {
            setError(
                getApiErrorMessage(
                    requestError,
                    editingNoteId
                        ? "Unable to update agenda note"
                        : "Unable to create agenda note"
                )
            );
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (
        note
    ) => {
        const shouldDelete =
            window.confirm(
                `Delete "${note.title}"? This action cannot be undone.`
            );

        if (!shouldDelete) {
            return;
        }

        setDeletingNoteId(
            note.id
        );

        setError("");
        setSuccessMessage("");

        try {
            await deleteAgendaNote(
                note.id
            );

            setNotes(
                (currentNotes) =>
                    currentNotes.filter(
                        (currentNote) =>
                            currentNote.id
                            !== note.id
                    )
            );

            if (
                editingNoteId
                === note.id
            ) {
                closeForm();
            }

            setSuccessMessage(
                "Agenda note deleted successfully"
            );
        } catch (requestError) {
            setError(
                getApiErrorMessage(
                    requestError,
                    "Unable to delete agenda note"
                )
            );
        } finally {
            setDeletingNoteId(null);
        }
    };

    return (
        <div className="agenda-page">
            <Navbar />

            <main className="agenda-content">
                <section className="agenda-hero">
                    <div className="agenda-hero-copy">
                        <span className="agenda-eyebrow">
                            Personal workspace
                        </span>

                        <h1>
                            Plan, reflect and
                            <span>
                                {" "}
                                stay organized.
                            </span>
                        </h1>

                        <p>
                            Keep private daily notes,
                            record trading decisions
                            and review your activity
                            through a clear monthly
                            calendar.
                        </p>
                    </div>

                    <div className="agenda-hero-stats">
                        <article>
                            <span>
                                Monthly notes
                            </span>

                            <strong>
                                {
                                    visibleMonthNotes
                                        .length
                                }
                            </strong>
                        </article>

                        <article>
                            <span>
                                Active days
                            </span>

                            <strong>
                                {activeDays}
                            </strong>
                        </article>

                        <article>
                            <span>
                                Selected day
                            </span>

                            <strong>
                                {
                                    selectedNotes
                                        .length
                                }
                            </strong>
                        </article>
                    </div>
                </section>

                {error && (
                    <div className="agenda-alert error">
                        <span>!</span>
                        {error}
                    </div>
                )}

                {successMessage && (
                    <div className="agenda-alert success">
                        <span>✓</span>
                        {successMessage}
                    </div>
                )}

                <section className="agenda-workspace">
                    <article className="agenda-calendar-panel">
                        <div className="agenda-calendar-toolbar">
                            <div>
                                <span className="agenda-eyebrow">
                                    Monthly view
                                </span>

                                <h2>
                                    {formatMonthTitle(
                                        visibleMonth
                                    )}
                                </h2>
                            </div>

                            <div className="agenda-calendar-actions">
                                <button
                                    type="button"
                                    className="agenda-today-button"
                                    onClick={goToToday}
                                >
                                    Today
                                </button>

                                <button
                                    type="button"
                                    className="agenda-month-button"
                                    onClick={() =>
                                        moveMonth(-1)
                                    }
                                    aria-label="Previous month"
                                >
                                    <CalendarArrow
                                        direction="left"
                                    />
                                </button>

                                <button
                                    type="button"
                                    className="agenda-month-button"
                                    onClick={() =>
                                        moveMonth(1)
                                    }
                                    aria-label="Next month"
                                >
                                    <CalendarArrow
                                        direction="right"
                                    />
                                </button>

                                <button
                                    type="button"
                                    className="agenda-refresh-button"
                                    onClick={() =>
                                        void loadNotes(
                                            false
                                        )
                                    }
                                    disabled={isRefreshing}
                                >
                                    {isRefreshing
                                        ? "Refreshing"
                                        : "Refresh"}
                                </button>
                            </div>
                        </div>

                        <div className="agenda-weekdays">
                            {WEEK_DAYS.map(
                                (weekDay) => (
                                    <span
                                        key={weekDay}
                                    >
                                        {weekDay}
                                    </span>
                                )
                            )}
                        </div>

                        {isLoading ? (
                            <div className="agenda-calendar-loading">
                                <span className="agenda-loader" />

                                <strong>
                                    Loading calendar
                                </strong>

                                <p>
                                    Retrieving your private
                                    agenda notes.
                                </p>
                            </div>
                        ) : (
                            <div className="agenda-calendar-grid">
                                {calendarDays.map(
                                    (date) => {
                                        const dateKey =
                                            createDateKey(
                                                date
                                            );

                                        const dayNotes =
                                            notesByDate.get(
                                                dateKey
                                            ) || [];

                                        const isCurrentMonth =
                                            isSameMonth(
                                                date,
                                                visibleMonth
                                            );

                                        const isToday =
                                            dateKey
                                            === todayKey;

                                        const isSelected =
                                            dateKey
                                            === selectedDate;

                                        const classNames = [
                                            "agenda-calendar-day",
                                            isCurrentMonth
                                                ? ""
                                                : "outside",
                                            isToday
                                                ? "today"
                                                : "",
                                            isSelected
                                                ? "selected"
                                                : "",
                                            dayNotes.length > 0
                                                ? "has-notes"
                                                : "",
                                        ]
                                            .filter(Boolean)
                                            .join(" ");

                                        return (
                                            <button
                                                type="button"
                                                className={
                                                    classNames
                                                }
                                                key={
                                                    dateKey
                                                }
                                                onClick={() =>
                                                    selectCalendarDay(
                                                        date
                                                    )
                                                }
                                                aria-pressed={
                                                    isSelected
                                                }
                                            >
                                                <div className="agenda-day-heading">
                                                    <span className="agenda-day-number">
                                                        {
                                                            date.getDate()
                                                        }
                                                    </span>

                                                    {dayNotes.length
                                                        > 0 && (
                                                        <span className="agenda-day-count">
                                                            {
                                                                dayNotes
                                                                    .length
                                                            }
                                                        </span>
                                                    )}
                                                </div>

                                                {dayNotes.length
                                                    > 0 && (
                                                    <div className="agenda-day-preview">
                                                        <span>
                                                            {
                                                                dayNotes[0]
                                                                    .title
                                                            }
                                                        </span>

                                                        {dayNotes.length
                                                            > 1 && (
                                                            <small>
                                                                +
                                                                {
                                                                    dayNotes
                                                                        .length
                                                                    - 1
                                                                }
                                                                {" "}
                                                                more
                                                            </small>
                                                        )}
                                                    </div>
                                                )}

                                                <div className="agenda-day-dots">
                                                    {dayNotes
                                                        .slice(
                                                            0,
                                                            3
                                                        )
                                                        .map(
                                                            (
                                                                note
                                                            ) => (
                                                                <span
                                                                    key={
                                                                        note.id
                                                                    }
                                                                />
                                                            )
                                                        )}
                                                </div>
                                            </button>
                                        );
                                    }
                                )}
                            </div>
                        )}
                    </article>

                    <aside className="agenda-day-panel">
                        <div className="agenda-day-panel-heading">
                            <div>
                                <span className="agenda-eyebrow">
                                    Selected date
                                </span>

                                <h2>
                                    {formatSelectedDate(
                                        selectedDate
                                    )}
                                </h2>

                                <p>
                                    {selectedNotes.length
                                        === 0
                                        ? "No notes have been added for this day."
                                        : `${selectedNotes.length} private ${
                                            selectedNotes.length
                                            === 1
                                                ? "note"
                                                : "notes"
                                        } for this day.`}
                                </p>
                            </div>

                            {!isFormOpen && (
                                <button
                                    type="button"
                                    className="agenda-new-note-button"
                                    onClick={
                                        openCreateForm
                                    }
                                >
                                    <span>+</span>
                                    New note
                                </button>
                            )}
                        </div>

                        {isFormOpen && (
                            <form
                                className="agenda-note-form"
                                onSubmit={
                                    handleSubmit
                                }
                            >
                                <div className="agenda-form-heading">
                                    <div>
                                        <span>
                                            {editingNoteId
                                                ? "Edit note"
                                                : "New daily note"}
                                        </span>

                                        <strong>
                                            {formatSelectedDate(
                                                selectedDate
                                            )}
                                        </strong>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={
                                            closeForm
                                        }
                                        aria-label="Close note form"
                                    >
                                        ×
                                    </button>
                                </div>

                                <label>
                                    <span>
                                        Title
                                    </span>

                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(
                                            event
                                        ) =>
                                            setTitle(
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        maxLength={120}
                                        placeholder="Example: Portfolio review"
                                        disabled={
                                            isSaving
                                        }
                                        autoFocus
                                    />

                                    <small>
                                        {title.length}
                                        /120
                                    </small>
                                </label>

                                <label>
                                    <span>
                                        Note
                                    </span>

                                    <textarea
                                        value={content}
                                        onChange={(
                                            event
                                        ) =>
                                            setContent(
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        maxLength={5000}
                                        rows={8}
                                        placeholder="Write your thoughts, plans or decisions for this day..."
                                        disabled={
                                            isSaving
                                        }
                                    />

                                    <small>
                                        {content.length}
                                        /5000
                                    </small>
                                </label>

                                <div className="agenda-form-actions">
                                    <button
                                        type="button"
                                        className="agenda-cancel-button"
                                        onClick={
                                            closeForm
                                        }
                                        disabled={
                                            isSaving
                                        }
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="agenda-save-button"
                                        disabled={
                                            isSaving
                                        }
                                    >
                                        {isSaving
                                            ? "Saving..."
                                            : editingNoteId
                                                ? "Save changes"
                                                : "Add note"}
                                    </button>
                                </div>
                            </form>
                        )}

                        {!isFormOpen
                            && selectedNotes.length
                            === 0 && (
                            <div className="agenda-empty-day">
                                <span className="agenda-empty-icon">
                                    <svg
                                        viewBox="0 0 24 24"
                                        aria-hidden="true"
                                    >
                                        <rect
                                            x="4"
                                            y="5"
                                            width="16"
                                            height="15"
                                            rx="3"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.6"
                                        />

                                        <path
                                            d="M8 3V7M16 3V7M4 9H20M8 13H16M8 16H13"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeLinecap="round"
                                            strokeWidth="1.6"
                                        />
                                    </svg>
                                </span>

                                <strong>
                                    Start writing
                                </strong>

                                <p>
                                    Record what you did,
                                    decisions you made or
                                    plans you want to
                                    remember.
                                </p>

                                <button
                                    type="button"
                                    onClick={
                                        openCreateForm
                                    }
                                >
                                    Create first note
                                </button>
                            </div>
                        )}

                        {!isFormOpen
                            && selectedNotes.length
                            > 0 && (
                            <div className="agenda-notes-list">
                                {selectedNotes.map(
                                    (note) => (
                                        <article
                                            className="agenda-note-card"
                                            key={note.id}
                                        >
                                            <div className="agenda-note-card-heading">
                                                <div>
                                                    <span className="agenda-note-time">
                                                        {formatNoteTime(
                                                            note.updatedAt
                                                            || note.createdAt
                                                        )}
                                                    </span>

                                                    <h3>
                                                        {
                                                            note.title
                                                        }
                                                    </h3>
                                                </div>

                                                <div className="agenda-note-actions">
                                                    <button
                                                        type="button"
                                                        className="edit"
                                                        onClick={() =>
                                                            openEditForm(
                                                                note
                                                            )
                                                        }
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="delete"
                                                        onClick={() =>
                                                            void handleDelete(
                                                                note
                                                            )
                                                        }
                                                        disabled={
                                                            deletingNoteId
                                                            === note.id
                                                        }
                                                    >
                                                        {deletingNoteId
                                                            === note.id
                                                            ? "Deleting"
                                                            : "Delete"}
                                                    </button>
                                                </div>
                                            </div>

                                            <p>
                                                {
                                                    note.content
                                                }
                                            </p>

                                            {note.updatedAt
                                                !== note.createdAt && (
                                                <small className="agenda-note-edited">
                                                    Edited
                                                </small>
                                            )}
                                        </article>
                                    )
                                )}
                            </div>
                        )}
                    </aside>
                </section>
            </main>
        </div>
    );
}

export default AgendaPage;