BigBrother.registerPartyMember({
    id: 'app-component', 
    watchers: { message: 'Hello, World!' }
});

BigBrother.registerPartyMember({
    id: 'main-component',
    watchers: {
        title: 'Title',
        titleClass: 'red',
        titleId: 'bg-yellow',
        showTitle: true,
    },
    listeners: {
        switchClass: function() {
            const titleClass = this.watchers.titleClass;
            this.watchers.titleClass = (titleClass === 'red' ? 'blue' : 'red');
        },
        switchId: function() {
            const titleId = this.watchers.titleId;
            this.watchers.titleId = (titleId === 'bg-cyan' ? 'bg-yellow' : 'bg-cyan');
        },
        toggleTitle: function(event) {
            const showTitle = event.target.checked;
            this.watchers.showTitle = showTitle;
        }
    }
});

BigBrother.registerPartyMember({
    id: 'date-component',
    watchers: { date: '2021-02-01' }
});

BigBrother.registerPartyMember({
    id: 'select-component',
    watchers: {
        text: ['Zero', 'One', 'Two']
    },
    listeners: {
        updateText: function(event) {
            this.watchers.text[0] = event.target.value;
            this.watchers.text[2] = this.parent.watchers.message;
            console.log(this.children);
        }
    }
});

window.onload = () => BigBrother.beginWatching();
