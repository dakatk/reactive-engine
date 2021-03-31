import BigBrother from '../lib/ingsoc';

const SelectExampleComponent = BigBrother({
    id: 'select-example',
    watchers: {
        text: ['Zero', 'One', 'Two']
    },
    listeners: {
        updateText: function (event) {
            this.watchers.text[0] = event.target.value;
        }
    }
}, true);

export default SelectExampleComponent;