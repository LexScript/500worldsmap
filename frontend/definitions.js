window.definitions = {
    worlds: [
        {id: 1, name: 'Noralus', system: 'Gorund', position: {x: 389, y: 418}, infrastructure: 3},

        {id: 2, name: 'Masnet', system: 'Kasphos', position: {x: 1252.62, y: 577.70}, infrastructure: 2},
        {id: 3, name: 'Felgris Secundas', system: 'Osyma', position: {x: 1885.08, y: 229.54}, infrastructure: 3},
        {id: 4, name: 'Tarkad Vindix', system: 'Relis', position: {x: 2428.33, y: 678.91}, infrastructure: 3},
        {id: 5, name: 'Yawardet', system: 'Esvar', position: {x: 3218.62, y: 791.96}, infrastructure: 2},

        {id: 6, name: 'Karabas', system: 'Salen', position: {x: 125, y: 1368.09}, infrastructure: 4},
        {id: 7, name: 'Kryndar', system: 'Zur Mortalis', position: {x: 1002.58, y: 1170.11}, infrastructure: 2},
        {id: 8, name: 'Novamagnor', system: 'Heliodas', position: {x: 1911.35, y: 1337.36}, infrastructure: 2},
        {id: 9, name: 'Astarem', system: 'Ophros', position: {x: 2787.16, y: 1391.07}, infrastructure: 4},

        {id: 10, name: 'Marvinus', system: 'Diodecis', position: {x: 488.95, y: 2262.42}, infrastructure: 3},
        {id: 11, name: 'Caltus Novem', system: 'Vespator', position: {x: 1152.18, y: 1826.60}, infrastructure: 3},
        {id: 12, name: 'Vilkus Decima', system: 'Vilkum', position: {x: 1710.35, y: 2273.27}, infrastructure: 2},
        {id: 13, name: 'Ikaron Prime', system: 'Ikaron', position: {x: 3029.21, y: 2117.93}, infrastructure: 3}
    ],
    factions: [
        {
            id: 1,
            name: 'Imperium',
            color: '#3864ce',
            ships: [{id: 1, player: 'Dima', img: 'dima.png'}, {id: 2, player: 'Nick', img: 'nick.png'}]
        },
        {
            id: 2,
            name: 'Marauders',
            color: '#6eea66',
            ships: [{id: 3, player: 'Alex', img: 'alex.png'}, {id: 4, player: 'Volkan', img: 'volkan.png'}]
        },
        {
            id: 3,
            name: 'Chaos',
            color: '#ca1c1c',
            ships: [{id: 5, player: 'Te-Yun', img: 'teyun.png'}, {id: 6, player: 'Falk', img: 'falk.png'}]
        },
    ],
    infrastructure: [
        'stronghold',
        'staging grounds',
        'support facility',
        'fortification line',
    ]
}