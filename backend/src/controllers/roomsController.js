    let roomsMockedData = [
        { id: 1, description: "Massage room"},
        {id: 2, description: "Therapy room"}
    ];

    export const listRooms = (req, res) => {
        return res.status(200).json(roomsMockedData);
    };

    export const createRoom = (req, res) => {
        const {description} = req.body;
        
        if (!description) {
        return res.stataus(400).json({erro: "A descrição da sala é obrigatória"})
    };

    const newRoom = {
    id: roomsMockedData.length + 1,
    description
    };

    rooms.push(newRoom);

    return res.status(201).json({
    message: "Room created.",
    room: newRoom
    });
};
