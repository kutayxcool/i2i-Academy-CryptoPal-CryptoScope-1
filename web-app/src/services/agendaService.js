import api from "./api";

export const getAgendaNotes = (
    startDate,
    endDate
) => {
    return api.get(
        "/agenda/notes",
        {
            params: {
                startDate,
                endDate,
            },
        }
    );
};

export const createAgendaNote = (
    noteData
) => {
    return api.post(
        "/agenda/notes",
        noteData
    );
};

export const updateAgendaNote = (
    noteId,
    noteData
) => {
    return api.put(
        `/agenda/notes/${noteId}`,
        noteData
    );
};

export const deleteAgendaNote = (
    noteId
) => {
    return api.delete(
        `/agenda/notes/${noteId}`
    );
};