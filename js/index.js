/*
	Get Date
*/  
var elDate = document.querySelector('span#dateNow');
var today = new Date();
var dd = today.getDate();
var mm = today.getMonth()+1; //January is 0!
var yyyy = today.getFullYear();

if(dd<10){dd='0'+dd};
if(mm<10){mm='0'+mm};
today=mm+'/'+dd+'/'+yyyy;
elDate.innerHTML = today;

// Cashier


var sales = new PouchDB('sales'),
	inventory = PouchDB('inventory'),
	account = PouchDB('account');

account.changes({
  since: 'now',
  live: true
}).on('change', cashierAccountDocs);

function cashierAccountDocs(){
	account.allDocs({include_docs: true, descending: false}, function(err, doc){
		getAccount(doc.rows)
	});
};

function getAccount(data){
	var awesAccount = document.getElementById('autoAccount');
	awesAccount.innerHTML = ''
	data.forEach(function(data){
		accountData(data.doc);
	});
};

function accountData(data){
	var awesAccount = document.getElementById('autoAccount');
	awesAccount.innerHTML = ''
	var awesList = document.createElement('option');
	awesList.setAttribute('value', data._id);
	awesList.setAttribute('id', data._id)
	awesList.innerHTML = data.name
	awesAccount.appendChild(awesList)
	return awesAccount
};

function parseStringAccount(data){
	var inputName = document.querySelector('input#accountName')
	var index = data.indexOf('_');
	inputName.setAttribute('data', inputName.value)
	accountDocsS(inputName.value);
	var sliced = data.slice(0, index);
	inputName.value = sliced;
}

function accountDocsS(data){
	account.get(data).then(function(doc){
		console.log('Success finding account!')
		var discountSpan = document.querySelector('span#discount');
		discountSpan.innerHTML = ""
		discountSpan.innerHTML = '.'+ doc.discount
	}).catch(function(err){
		console.log('There is no account for this ID')
	});
}

// Products

inventory.changes({
  since: 'now',
  live: true
}).on('change', cashierInventoryDocs);
function cashierInventoryDocs(){
	inventory.allDocs({include_docs: true, descending: false}, function(err, doc){
		getInventory(doc.rows)
	});
}

function getInventory(data){
	var awesProduct = document.getElementById('autoProduct');
	awesProduct.innerHTML = '';
	data.forEach(function(data){
		inventoryData(data.doc);
	});
};

function inventoryData(data){
	var awesProduct = document.getElementById('autoProduct');
	var awesList = document.createElement('option');
	awesList.setAttribute('value', data._id);
	awesList.setAttribute('id', data._id)
	awesList.innerHTML = data.code
	awesProduct.appendChild(awesList)
	return awesProduct
};

function parseStringInventory(data){
	var inputName = document.querySelector('input#productCode')
	inputName.setAttribute('data', inputName.value)
	stockLeft(inputName.getAttribute('data'))
	var index = data.indexOf('_');
	var sliced = data.slice(0, index);
	inputName.value = sliced;
}

function stockLeft(data){
	var inputName = document.querySelector('input#quantity');
	inventory.get(data).then(function(doc){
		inputName.setAttribute('placeholder', doc.stock + ' stock(s) left')
	}).catch(function(err){
		console.log(err)
	});
}

function rawInventoryDocsS() {
	var inputName = document.querySelector('input#productCode');
	console.log(inputName.getAttribute('data'))
	inventoryDocsS(inputName.getAttribute('data'))
}

function inventoryDocsS(data){
	inventory.get(data).then(function(doc){
		console.log(doc)
		cashierDisplay(doc);
		console.log('Success adding product!')
	}).catch(function(err){
		console.log(err)
	});
};

function totalAmount(price) {
	var spanAmount = document.querySelector('span#totalAmount')
	var total = parseInt(spanAmount.innerHTML) + price;
	spanAmount.innerHTML = parseInt(total)
}

function cashierDisplay(doc){
	var display = document.querySelector('ul#collectionDisplayS');
	var data = document.querySelector('input#productCode').getAttribute('data');
	var li = document.createElement('li');
	var title = document.createElement('span');
	var p = document.createElement('p');
	var price = document.createElement('span');
	var priceSpan = document.createElement('span')
	var stockSpan = document.createElement('span')
	var stockEnd = document.createElement('span')
	var br = '<br>';
	var deleteBtn = document.createElement('a');
	
	var quantity = parseInt(document.querySelector('input#quantity').value);
	var discount = parseFloat(document.querySelector('span#discount').innerHTML);
	var numPrice = parseInt(doc.price)
	var formula = numPrice - (discount * numPrice)
	var equals = formula * quantity;

	console.log('Numbers:' +  quantity + ' ' + discount + ' ' + numPrice + ' ' + 'formula answer: ' + formula + ' ' + 'equals answer: ' + equals)
	li.setAttribute('style', 'font-variant: petite-caps')
	li.className = 'collection-item avatar receipt'
	li.setAttribute('data', data)

	title.className = 'title';
	title.innerHTML = 'JF00' + doc.code;

	stockSpan.id = 'stockSpan';
	stockSpan. innerHTML = quantity;
	stockEnd.innerHTML = 'stock(s)'
	p.innerHTML = 'Customer is buying ';
	price.className = 'right';
	price.innerHTML = 'Php '
	priceSpan.innerHTML = equals
	priceSpan.className = 'priceList'
	deleteBtn.innerHTML = 'delete';
	deleteBtn.className = 'btn red waves-effect waves-light secondary-content'
	deleteBtn.addEventListener('click', deleteButtonPress.bind(this))

	display.appendChild(li);
	li.appendChild(title);
	li.appendChild(p);
	p.appendChild(stockSpan);
	p.appendChild(stockEnd);
	p.appendChild(price);
	price.appendChild(priceSpan);

	totalAmount(equals);
	var inputName = document.querySelector('input#productCode');
	var quantity = document.querySelector('input#quantity');
	inputName.value = '';
	quantity.value = '';
}

function deleteButtonPress(data){
	console.log(data);
}


function receipt(length, totalAmount, account){
	var length = document.querySelectorAll('li.collection-item.avatar.receipt').length
	var totalAmount = document.querySelector('span#totalAmount').innerHTML;
	var account = document.querySelector('input#accountName').getAttribute('data');

	var doc = {
		"_id": new Date().toUTCString(),
		"total": totalAmount,
		"consumer": account
	}

	sales.put(doc).then(function(result){
		console.log(result);
		Materialize.toast('Sucess!')
	}).catch(function(err){
		console.log(err)
	})

	//update inventory
	var listItem = document.querySelectorAll('li.collection-item.avatar.receipt');
	listItem.forEach(function(el){
		var id = el.getAttribute('data');
		var stockM = el.querySelector('#stockSpan').innerHTML; 
		updateInventory(id, stockM);
	});

	// Update Account
	bags = [];
	listItem.forEach(function(el){		
		var stock = el.querySelector('#stockSpan').innerHTML;
		bags.push(stock)
	});
	total = 0;
	for(i=0; bags.length < i; i++){
		parseInt(bags[i]) + total
		console.log(total)
	}
	updateAccount(total, totalAmount);

	// clear 

};

function updateInventory(data, stockM){
	inventory.get(data).then(function(doc){
		doc.stock = doc.stock - stockM;
		return inventory.put(doc)
	}).catch(function(err){
		console.log(err)
	});
}

function updateAccount(total, amount){
	var accountData = document.querySelector('input#accountName').getAttribute('data');
	account.get(accountData).then(function(doc){
			doc.total_sales = parseInt(doc.total_sales) + parseInt(amount);
			return account.put(doc)
		}).catch(function(err){
			console.log(err);
		});
		clearVal();
}

cashierAccountDocs();
cashierInventoryDocs();
clearVal();
function clearVal(){
	var account = document.querySelector('input#accountName');
	var product = document.querySelector('input#productCode');
	var quantity = document.querySelector('input#quantity');
	var list = document.querySelector('ul#collectionDisplayS');
	account.value  = '';
	product.value  = '';
	quantity.value = '';
	list.innerHTML = '';
}
// Chart


var dataS = new Array();

function chartDocs(){
	sales.allDocs({include_docs: true, descending: false}, function(err, doc){
		chartSales(doc.rows)
	});
};

function chartSales(data){
	data.forEach(function(data){
		dataS.push(chartPush(data.doc));
	})
	showChart(dataS)
}

function chartPush(doc){
	return parseInt(doc.total)
}



function showChart(dataS){
	console.log(dataS)
var ctx = document.getElementById("myChart");
var myChart = new Chart(ctx,{
  		 type: 'line',
    data: {
        labels: [],
		datasets: [
	        {
	            label: "Sales",
	            fill: false,
	            lineTension: 0.4,
	            backgroundColor: "rgba(75,192,192,0.4)",
	            borderColor: "rgba(75,192,192,1)",
	            borderCapStyle: 'butt',
	            borderDash: [],
	            borderDashOffset: 0.0,
	            borderJoinStyle: 'miter',
	            pointBorderColor: "rgba(75,192,192,1)",
	            pointBackgroundColor: "#fff",
	            pointBorderWidth: 1,
	            pointHoverRadius: 5,
	            pointHoverBackgroundColor: "rgba(75,192,192,1)",
	            pointHoverBorderColor: "rgba(220,220,220,1)",
	            pointHoverBorderWidth: 2,
	            pointRadius: 2,
	            pointHitRadius: 10,
	            data: dataS,
	            spanGaps: false,
	            beginAtZero: true
	        }
	    ]
    }
	});
};

chartDocs()