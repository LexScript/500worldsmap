class Worlds {
    constructor() {
        const url = new URL(window.location.href)

        this.data = null;
        this.edit = url.searchParams.get("edit") === "true"

        this.scale = 1

        this.isDraggingShip = false
        this.isDraggingMap = false;

        // ship dragging stuff
        this.activeShip = null
        this.shipOffsetX = 0
        this.shipOffsetY = 0

        // infrastructure editing stuff
        this.editInfrastructure = null;
    }

    async init() {
        this.initNavigation()
        await this.load()
        this.initInfrastructureDialog()
        this.draw()
        this.bindToggleTablet()
        return;
    }

    bindToggleTablet() {
        document.getElementById('tablet').addEventListener('click', () => {
            document.getElementById('tablet').classList.toggle('tablet-open');
        })
    }

    initInfrastructureDialog() {
        const infraPopup = document.querySelector('#edit-infrastructure');
        const tbody = infraPopup.querySelector('tbody')
        window.definitions.factions.forEach((f) => {
            const tr = document.createElement('tr');
            window.definitions.infrastructure.forEach((infra, i) => {
                const td = document.createElement('td');
                const wrapper = document.createElement('div');
                wrapper.className = 'infrastructure';
                wrapper.style.background = f.color;
                wrapper.innerHTML = `<img src="infrastructure/${infra}.svg" alt="${infra}" title="${infra.toUpperCase()}">`
                wrapper.onclick = async (event) => {
                    await this.setInfrastructure(this.editInfrastructure.world, this.editInfrastructure.pos, infra, f.name);
                    document.querySelector('#edit-infrastructure').style.display = 'none'
                }


                td.appendChild(wrapper)
                tr.appendChild(td)
            })
            tbody.appendChild(tr)
        });
    }

    initNavigation() {
        const container = document.getElementById('map-container')
        const map = document.getElementById('map')

        const minScale = 0.2
        const maxScale = 4

        let offsetX = 0
        let offsetY = 0

        let startX = 0
        let startY = 0

        const update = () => {
            map.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${this.scale})`
        }

        container.addEventListener('wheel', (e) => {
            e.preventDefault()

            const rect = container.getBoundingClientRect()
            const mouseX = e.clientX - rect.left
            const mouseY = e.clientY - rect.top

            const zoomFactor = 0.1
            const oldScale = this.scale

            if (e.deltaY < 0) {
                this.scale += zoomFactor
            } else {
                this.scale -= zoomFactor
            }

            this.scale = Math.max(minScale, Math.min(maxScale, this.scale))
            if (this.scale === oldScale) return

            const scaleRatio = this.scale / oldScale

            offsetX = mouseX - (mouseX - offsetX) * scaleRatio
            offsetY = mouseY - (mouseY - offsetY) * scaleRatio

            update()
        }, {passive: false})

        container.addEventListener('mousedown', (e) => {
            if (this.isDraggingShip) return
            this.isDraggingMap = true
            startX = e.clientX - offsetX
            startY = e.clientY - offsetY
            container.style.cursor = 'grabbing'
        })

        window.addEventListener('mouseup', () => {
            this.isDraggingMap = false
            container.style.cursor = 'grab'
        })

        window.addEventListener('mousemove', (e) => {
            if (!this.isDraggingMap) return

            offsetX = e.clientX - startX
            offsetY = e.clientY - startY

            update()
        })

        container.style.cursor = 'grab'
    }

    async setpowerLevel(worldName, factionName, powerLevel) {
        this.data[worldName].powerLevel[factionName] = powerLevel;
        await this.save();
        await this.load()
        this.draw();
    }

    async setInfrastructure(worldName, position, infrastructureName, factionName) {
        console.log(worldName, position, infrastructureName, factionName)
        while (position > this.data[worldName].infrastructure.length) {
            this.data[worldName].infrastructure.push({})
        }
        this.data[worldName].infrastructure[position - 1] = {
            faction: factionName,
            type: infrastructureName,
        };
        await this.save();
        await this.load()
        this.draw();
    }

    hexToRgb(hex) {
        hex = hex.replace('#', '')

        const bigint = parseInt(hex, 16)
        const r = (bigint >> 16) & 255
        const g = (bigint >> 8) & 255
        const b = bigint & 255

        return `${r}, ${g}, ${b}`
    }


    drawShips() {
        const map = document.getElementById('map')

        map.querySelectorAll('.ship').forEach(e => e.remove())

        const factions = window.definitions.factions

        factions.forEach(faction => {
            faction.ships.forEach(shipData => {
                const currentShipPos = this.data.ships.find(shipPos => shipPos.id === shipData.id)
                const shipObject = document.createElement('div');
                shipObject.style.left = currentShipPos.x + 'px';
                shipObject.style.top = currentShipPos.y + 'px';
                shipObject.title = shipData.player;
                shipObject.className = 'ship';

                const glow = document.createElement('div');
                glow.className = 'ship-glow';
                glow.style.background = `radial-gradient(circle, rgba(${this.hexToRgb(faction.color)}, 1) 0%, transparent 100%)`
                shipObject.appendChild(glow);

                const shipImage = document.createElement('div');
                shipImage.style.backgroundImage = `url(spaceships/${shipData.img})`;
                shipImage.className = 'ship-image';
                shipObject.appendChild(shipImage);

                if (this.edit) {
                    this.isDraggingShip = false
                    let offsetX = 0
                    let offsetY = 0

                    shipObject.addEventListener('mousedown', (e) => {

                        this.isDraggingShip = true

                        const rect = shipObject.getBoundingClientRect()
                        this.shipOffsetX = (e.clientX - rect.left) / this.scale
                        this.shipOffsetY = (e.clientY - rect.top) / this.scale

                        this.activeShip = {
                            el: shipObject,
                            id: shipData.id
                        }

                        e.stopPropagation()
                        shipObject.style.cursor = 'grabbing'
                    })

                    window.addEventListener('mousemove', (e) => {
                        if (!this.isDraggingShip || !this.activeShip) return

                        const mapRect = map.getBoundingClientRect()

                        const x = (e.clientX - mapRect.left) / this.scale - this.shipOffsetX
                        const y = (e.clientY - mapRect.top) / this.scale - this.shipOffsetY

                        this.activeShip.el.style.left = x + 'px'
                        this.activeShip.el.style.top = y + 'px'
                    })

                    window.addEventListener('mouseup', async () => {
                        if (!this.isDraggingShip || !this.activeShip) return

                        const {el, id} = this.activeShip

                        const finalX = parseFloat(el.style.left)
                        const finalY = parseFloat(el.style.top)

                        const ship = this.data.ships.find(s => s.id === id)
                        ship.x = finalX
                        ship.y = finalY

                        this.activeShip = null
                        this.isDraggingShip = false

                        await this.save()
                    })

                    shipObject.style.cursor = this.edit ? 'grab' : 'default'
                }

                map.appendChild(shipObject)
            })
        })
    }

    drawWorld() {
        const map = document.getElementById('map')
        const powerlevel = {
            imperium: 0,
            marauders: 0,
            chaos: 0
        }

        for (let world in this.data) {
            if (world !== 'ships') {
                const worldData = this.data[world]
                powerlevel.imperium += worldData.powerLevel.Imperium
                powerlevel.marauders += worldData.powerLevel.Marauders
                powerlevel.chaos += worldData.powerLevel.Chaos
            }
        }
        document.getElementById('score-imperium-current').innerText = powerlevel.imperium
        document.getElementById('score-marauders-current').innerText = powerlevel.marauders
        document.getElementById('score-chaos-current').innerText = powerlevel.chaos

        map.querySelectorAll('.world-box').forEach(e => e.remove())
        map.querySelectorAll('.infrastructure').forEach(e => e.remove())

        const worlds = window.definitions.worlds

        worlds.forEach(world => {
            const box = document.createElement('div')
            box.className = 'world-box'

            box.style.left = world.position.x + 'px'
            box.style.top = world.position.y + 'px'

            window.definitions.factions.forEach((faction, factionIndex) => {
                for (let i = 0; i < 5; i++) {
                    const powerLevelBox = document.createElement('div');
                    powerLevelBox.className = 'power-level';
                    powerLevelBox.style.left = (factionIndex * 33.4) + '%'
                    powerLevelBox.style.top = (i * 20) + '%'
                    powerLevelBox.classList.add(faction.name)
                    if (this.data[world.name].powerLevel[faction.name] === 4 - i) {
                        powerLevelBox.style.background = faction.color
                    }

                    if (this.edit) {
                        powerLevelBox.onclick = () => this.setpowerLevel(world.name, faction.name, 4 - i)
                    }


                    box.appendChild(powerLevelBox);
                }
            });

            for (let i = 0; i < world.infrastructure; i++) {
                const infrastructureBox = document.createElement('div');
                infrastructureBox.className = `infrastructure`;
                infrastructureBox.setAttribute('data-pos', i + 1)
                infrastructureBox.setAttribute('data-world', world.name)
                infrastructureBox.style.left = (166.5 + (i * 28)) + '%'

                if (this.edit) {
                    infrastructureBox.onclick = () => {
                        this.editInfrastructure = {pos: i + 1, world: world.name}
                        document.querySelector('#edit-infrastructure').style.display = 'block'
                    }
                }

                box.appendChild(infrastructureBox);
            }

            this.data[world.name].infrastructure.forEach((infrastructure, i) => {
                const infrastructureIcon = document.createElement('div');
                if (infrastructure.faction) {
                    infrastructureIcon.style.background = window.definitions.factions.find(f => {
                        return f.name === infrastructure.faction
                    }).color;
                    infrastructureIcon.innerHTML = `<img src="infrastructure/${infrastructure.type}.svg" alt="${infrastructure.type}">`;
                    infrastructureIcon.title = infrastructure.type.toUpperCase();

                    box.querySelector(`.infrastructure[data-pos="${i + 1}"]`).appendChild(infrastructureIcon);
                }
            })


            map.appendChild(box)
        })
    }

    draw() {
        this.drawWorld();
        this.drawShips();
    }

    async save() {
        await fetch('/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(this.data)
        })
        await this.load()
    }

    async load() {
        let res = await fetch('/', {method: 'POST'})
        this.data = await res.json();
    }

    show() {
        document.getElementById('indicator').classList.add('fade-out');

        setTimeout(() => {
            document.getElementById('app').classList.remove('fade-out');
            document.getElementById('indicator').style.display = 'none';
        }, 1000)
    }
};


(async () => {
    const worlds = new Worlds();
    await worlds.init();

    setTimeout(() => {
        worlds.show();
    }, 1000);
})();


