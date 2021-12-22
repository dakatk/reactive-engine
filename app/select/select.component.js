import PartyMember from '../../lib/party-member';

const SelectComponent = new PartyMember(
    'select-component',
    {
        text: ['Zero', 'One', 'Two']
    },
    {
        updateText: function (event) {
            const dateComponent = this.children.example;

            dateComponent.watchers.date = todaysDate();
            this.watchers.text[0] = event.target.value;
        }
    },
    'app/select/select.component.html');

function todaysDate() {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    
    return `${yyyy}-${mm}-${dd}`;
}

export default SelectComponent;