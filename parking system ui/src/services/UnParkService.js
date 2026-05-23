import apiClient from "../api/apiClient";

export const unparkVehicle = async (ticketNumber) => {
    const cleanedTicketNumber = ticketNumber.trim();

    const res = await apiClient.post(
        `/vehicle/unpark/${cleanedTicketNumber}`
    );

    // update localStorage here
    const storedTickets =
        JSON.parse(localStorage.getItem("tickets")) || [];

    const updatedTickets = storedTickets.filter(
        (ticket) =>
            ticket.ticketNumber !== cleanedTicketNumber
    );

    localStorage.setItem(
        "tickets",
        JSON.stringify(updatedTickets)
    );

    return res.data;
};