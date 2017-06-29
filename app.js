//BUDGET CONTROLLER
var budgetController = (function () {
    // each new item needs description and a value + distinguish by #id income vs. expense
    // create a function constructor for income and expense types
    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    Expense.prototype.calcPercentage = function(totalIncome)
    {
        if(totalIncome>0)
        {this.percentage=Math.round((this.value/totalIncome)*100);}
        else
        {this.percentage=-1;}
    };
    Expense.prototype.getPercentage=function()
    {return this.percentage;}; 
    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };
    var calculateTotal = function(type) {
        var sum = 0;
        // add all values in the array depending on if it's 'exp' or 'inc'
        data.allItems[type].forEach(function(currentElement){
            sum += currentElement.value;
        });
        // store the totals in the data object
        data.totals[type] = sum;
    };
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1 // because evaluated as non-existent
    };
    // create public method to allow other modules to add new items to the data structure
    return {
        addItem: function (type, desc, val) {
            var newItem, ID;
            // assign a unique id to each new expense or income item
            // ID = last ID + 1
            // create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            // console.log('The new ID for this item is: ' + ID);
            // create new item based on 'inc' or 'exp' type
            if (type === "exp") {
                newItem = new Expense(ID, desc, val);
            } else if (type === "inc") {
                newItem = new Income(ID, desc, val);
            }
            // add new exp or inc to the end of the allItems.exp or allItems.inc array
            data.allItems[type].push(newItem);
            // return the new item
            return newItem;
        },
        deleteItem: function(type,id){
            var ids,index;
            ids = data.allItems[type].map(function(current){
                return current.id;
            });
            index=ids.indexOf(id);
            if(index !== -1)
                {data.allItems[type].splice(index,1);}
        },
        calculateBudget: function() {
            // calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');
            // calculate budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;
            // calculate percentage of income that has already been spent
            if (data.totals.inc > 0){
                // if income > 0, then calculate the percent expenses
                data.percentage = Math.round( (data.totals.exp / data.totals.inc) * 100 );
            } else {
                // display nothing
                data.percentage = -1;
            }
        },
        calculatePercentages: function()
        {data.allItems.exp.forEach(function(cur)
            {cur.calcPercentage(data.totals.inc);
            });},
        getPercentages: function()
        {var allPerc = data.allItems.exp.map(function(cur)
            {return cur.getPercentage();});
        return allPerc;
        },
        getBudget: function(){
            // this method will just return the budget items
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },
        // this method is just for testing purposes
        testing: function () {
            console.log(data);
        }
    }
})();

//UI CONTROLLER
var UIController=(function()
	{var DOMstrings = {
		inputType:'.add__type',
		inputDescription:'.add__description',
		inputValue:'.add__value',
		inputBtn:'.add__btn',
		incomeContainer:'.income__list',
		expensesContainer:'.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container'
	};
		return{getInput:function()
		{return{type:document.querySelector(DOMstrings.inputType).value,
		description:document.querySelector(DOMstrings.inputDescription).value,
		value:parseFloat(document.querySelector(DOMstrings.inputValue).value)
	};
	},
	addListItem: function(obj,type){
		//1 create HTML string with placeholder text
		var html,newHtml,element;
		if(type === "inc"){
			element = DOMstrings.incomeContainer;
			html='<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
		}
			else if(type === "exp"){
				element = DOMstrings.expensesContainer;
				html='<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			}
		//2 replace placeholder text with some actual data
		newHtml = html.replace("%id%",obj.id);
		newHtml = newHtml.replace("%description%",obj.description);
		newHtml = newHtml.replace("%value%",obj.value);
		//3 insert the html in the DOM
		document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);
	},
    deleteListItem:function(selectorID)
    {var el = document.getElementById(selectorID);
        el.parentNode.removeChild(el);}, 
	clearFields(){
		var fields,fieldsArr;
		fields = document.querySelectorAll(DOMstrings.inputDescription + "," + DOMstrings.inputValue);
		fieldsArr = Array.prototype.slice.call(fields);
		fieldsArr.forEach(function(current,index,array){
			current.value="";
		});
		fieldsArr[0].focus();
	},
    displayBudget: function(obj){
        document.querySelector(DOMstrings.budgetLabel).textContent=obj.budget;
        document.querySelector(DOMstrings.incomeLabel).textContent=obj.totalInc;
        document.querySelector(DOMstrings.expensesLabel).textContent=obj.totalExp;
        document.querySelector(DOMstrings.percentageLabel).textContent=obj.percentage;
    },
	getDOMstrings:function(){return DOMstrings;}
};
})();
//GLOBAL APP CONTROLLER
var controller=(function(budgetCtrl,UICtrl)

	{setupEventListeners = function(){
		var DOM = UICtrl.getDOMstrings();
		document.querySelector(DOM.inputBtn).addEventListener('click',ctrlAddItem);
			document.addEventListener('keypress',function(event)
				{if (event.keyCode === 13 || event.which === 13)
				{ctrlAddItem();}}
			);
            document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem);
	};
		var updateBudget = function(){
			//1.calculate the budget
			budgetCtrl.calculateBudget();
			//2.return the budget
			var budget = budgetCtrl.getBudget();
			//3.display the budget on the UI
			UICtrl.displayBudget(budget);
        };
        var updatePercentages= function()
        {//1 Calculate percentages
            budgetCtrl.calculatePercentages();
            //2 Read percentages from the budget controller
            var percentages = budgetCtrl.getPercentages();
            //3 Update the UI with the new percentages
            console.log(percentages);
        };
		var ctrlAddItem=function()
		{var input,newItem;
			//1. Get the field input data
			input = UICtrl.getInput();
			if(input.description!=="" && !isNaN(input.value) && input.value>0)
			{
				//2. Add the item to the budget controller
			newItem = budgetCtrl.addItem(input.type,input.description,input.value);
			//3.Add the item to the UI
			UICtrl.addListItem(newItem,input.type);
			//4 Clear the fields
			UICtrl.clearFields();
			//5.calculate and update budget
			updateBudget();
            //6. Calculate and Update the percentages
            updatePercentages();
        }
			};
            var ctrlDeleteItem = function(event)
            {var itemID,splitID,type,ID;
                itemID=event.target.parentNode.parentNode.parentNode.parentNode.id;
                if(itemID)
                    {splitID=itemID.split("-");
                type=splitID[0];
                ID=parseInt(splitID[1]);
                //1.Delete the item from the data structure
                budgetCtrl.deleteItem(type,ID);
                //2.Delete the item from the UI
                UICtrl.deleteListItem(itemID);
                //3.Update and show the new budget
                updateBudget();
            //6. Calculate and Update the percentages
        updatePercentages();
    }
            };
		return{init: function(){console.log("Application has started.")
		setupEventListeners();}};
		}
	)(budgetController,UIController);
	controller.init();
