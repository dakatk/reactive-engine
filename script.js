import BigBrother from './ingsoc.js';

window.addEventListener('DOMContentLoaded', () => {
    const MainComponent = new BigBrother({
        id: 'main',
        watchers: {
            title: 'Title',
            titleClass: 'red',
            titleId: 'bg-yellow',
            showTitle: true,
        },
        listeners: {
            switchClass: function () {
                const titleClass = this.watchers.titleClass;
                this.watchers.titleClass = (titleClass === 'red' ? 'blue' : 'red');
            },
            switchId: function () {
                const titleId = this.watchers.titleId;
                this.watchers.titleId = (titleId === 'bg-green' ? 'bg-yellow' : 'bg-green');
            },
            toggleTitle: function (event) {
                const showTitle = event.target.checked;
                this.watchers.showTitle = showTitle;
            }
        }
    });

    const SelectExampleComponent = new BigBrother({
        id: 'select-example',
        watchers: {
            text: ['Zero', 'One', 'Two']
        },
        listeners: {
            updateText: function (event) {
                this.watchers.text[0] = event.target.value;
            }
        }
    });
});
