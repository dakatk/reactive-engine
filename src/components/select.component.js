import BigBrother from '../lib/ingsoc';

const SelectComponent = new BigBrother({
    id: 'select-component',
    watchers: {
        text: ['Zero', 'One', 'Two']
    },
    listeners: {
        updateText: function (event) {
            this.watchers.text[0] = event.target.value;
        }
    }
}, true);

export default SelectComponent;