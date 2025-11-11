import luffy_image from "./assets/Luffy Gears 5 Wallpaper.jpg";
import zoro_image from "./assets/Zoro.png"
import robin_image from "./assets/Nico Robin.jpg"

export const characters = [
    {
        name: "Monkey D. Luffy",
        alias: ["luffy", "monkey d luffy", "strawhat luffy"],
        image: luffy_image,
        hints: [
            "I am the captain of the Straw Hat Pirates.",
            "I have the ability to stretch my body like rubber.",
            "My dream is to become the Pirate King."
        ]
    },
    {
        name: "Roronoa Zoro",
        alias: ["zoro", "zolo"],
        image: zoro_image,
        hints: [
            "I am the swordsman of the Straw Hat Pirates.",
            "I use a unique three-sword style in battle.",
            "My dream is to become the world's greatest swordsman."
        ]
    },

    {
        name: "Nico Robin",
        alias: ["robin", "nico robin", "miss all sunday", "Demon Child"],
        image: robin_image,
        hints: [
            "I am the archaeologist of the Straw Hat Pirates.",
            "I have a bounty of 930 million berries.",
            "My dream is to uncover the true history of the world."
        ]
    },
]