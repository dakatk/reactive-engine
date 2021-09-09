import BigBrother from '../lib/ingsoc';

const MainComponent = new BigBrother({
    id: 'main-component',
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
            this.watchers.titleId = (titleId === 'bg-cyan' ? 'bg-yellow' : 'bg-cyan');
        },
        toggleTitle: function (event) {
            const showTitle = event.target.checked;
            this.watchers.showTitle = showTitle;
        }
    }
}, true);

export default MainComponent;
