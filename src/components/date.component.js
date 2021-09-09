import BigBrother from '../lib/ingsoc';

const DateComponent = new BigBrother({
    id: 'date-component',
    watchers: {
        date: "2021-01-01"
    },
    listeners: {}
});

export default DateComponent;