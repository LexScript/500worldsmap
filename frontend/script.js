class Worlds {
    constructor() {
        this.data = null;
    }

    async init() {
        this.initNavigation()
        await this.load()
        this.draw()
        return;
    }

    initNavigation() {
        const container = document.getElementById('map-container')
        const map = document.getElementById('map')

        let scale = 1
        const minScale = 0.2
        const maxScale = 4

        let offsetX = 0
        let offsetY = 0

        let isDragging = false
        let startX = 0
        let startY = 0

        const update = () => {
            map.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`
        }

        container.addEventListener('wheel', (e) => {
            e.preventDefault()

            const rect = container.getBoundingClientRect()
            const mouseX = e.clientX - rect.left
            const mouseY = e.clientY - rect.top

            const zoomFactor = 0.1
            const oldScale = scale

            if (e.deltaY < 0) {
                scale += zoomFactor
            } else {
                scale -= zoomFactor
            }

            scale = Math.max(minScale, Math.min(maxScale, scale))
            if (scale === oldScale) return

            const scaleRatio = scale / oldScale

            offsetX = mouseX - (mouseX - offsetX) * scaleRatio
            offsetY = mouseY - (mouseY - offsetY) * scaleRatio

            update()
        }, {passive: false})

        container.addEventListener('mousedown', (e) => {
            isDragging = true
            startX = e.clientX - offsetX
            startY = e.clientY - offsetY
            container.style.cursor = 'grabbing'
        })

        window.addEventListener('mouseup', () => {
            isDragging = false
            container.style.cursor = 'grab'
        })

        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return

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

    draw() {
        const map = document.getElementById('map')

        map.querySelectorAll('.world-box').forEach(e => e.remove())

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

                    powerLevelBox.onclick = () => this.setpowerLevel(world.name, faction.name, 4 - i)

                    box.appendChild(powerLevelBox);
                }
            });

            map.appendChild(box)
        })
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


