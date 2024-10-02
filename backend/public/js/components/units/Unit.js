import UnitCard from './UnitCard.js';
import UnitDelete from './UnitDelete.js';
import UnitEdit from './UnitEdit.js';
import UnitModel from './UnitModel.js';
import UnitService from '../../service/UnitService.js';
import { refreshUnits } from '../../enote.js';

class Unit {
    
    constructor(parent, model, unitsArray, onUnitsChange, currentUser) {
        this.parent = parent;
        this.model = model instanceof UnitModel ? model : new UnitModel().load(model);
        this.unitsArray = unitsArray;
        this.onUnitsChange = onUnitsChange;

        this.handleChange = () => {};

        this.card = new UnitCard(this.parent, this.model, currentUser);
        this.edit = new UnitEdit(this.model);
        this.delete = new UnitDelete(this.model);

        this.card.onEditClick(() => {
            this.edit.render();
        });

        this.card.onDeleteClick(() => {
            this.delete.render();
        });

        this.edit.submit("SAVE", async () => {
            const data = this.edit.getFormData();
            this.model.load(data);
            await UnitService.updateUnit(this.model.id, data);
            await refreshUnits();
        });

        this.delete.submit(async () => {
            try {
                await UnitService.deleteUnit(this.model.id);
                this.delete.close();
                this.parent.removeChild(this.card.component);

                const index = this.unitsArray.findIndex(unit => unit.id === this.model.id);
                if (index !== -1) {
                    this.unitsArray.splice(index, 1);
                }

                this.handleChange();
                await refreshUnits();
            } catch (error) {
                console.error("Napaka pri brisanju enote: ", error);
            }
        });
    }

    load(data) {
        this.model.load(data);
        return this;
    }

    onChange(func) {
        this.handleChange = func;
    }

    render() {
        this.card.render();
    }

    updateCard() {
        this.card.component.remove();
        this.card = new UnitCard(this.parent, this.model);
        
        this.card.onEditClick(() => {
            this.edit.render();
        });
        
        this.card.onDeleteClick(() => {
            this.delete.render();
        });
        
        this.card.render();
    }
}

export default Unit;