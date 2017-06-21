/***
	 ---------
	 Resources
	 ---------
	 * Online Documentation: 
	 * Repository: https://github.com/peicap/metax-cashier
	 * Author: Pei Capili
	 * Github: https://github.com/peicap
***/

var product = new PouchDB('product_db');
var customer  = new PouchDB('customer_db');
var receipt   = new PouchDB('receipt_db');
var index = new PouchDB('index_db');

customer.changes({
  since: 'now',
  live: true
}).on('change', docscustomer);

product.changes({
  since: 'now',
  live: true
}).on('change', docsproduct);

// Add new customer in database
function ncustomer(){
	var customerName = document.getElementById('new-customer-val');

	var doc = {
		"_id": new Date().toISOString(),
		'customer_name': customerName.value,
		'last_transaction': new Date().toUTCString(),
		'date_created': new Date().toUTCString(),
		'total_transaction': 0
	};

	customer.put(doc).then(function(results){
		console.log(results);
	}).catch(function(err){
		console.log(err)
	});
	customerName.value = '';
}

// Add new product in database
function nproduct(){
	var productName = document.getElementById('new-product-name'),
			productQuantity = document.getElementById('new-product-quantity'),
			productPrice = document.getElementById('new-product-price');

	var doc = {
		"_id": new Date().toISOString(),
		"product_name": productName.value,
		"product_quantity": productQuantity.value,
		"product_price": productPrice.value,
		"date_created": new Date().toUTCString()
		};

	product.put(doc).then(function(results){
		console.log(results);
	}).catch(function(err){
		console.log(err)
	});
	productName.value = '';
	productQuantity.value = '';
	productPrice.value = '';
}

// Fetch all docs in customer database
function docscustomer(){
	customer.allDocs({include_docs: true, descending: false}, function(err, doc){
		dcustomer(doc.rows);
		awestransname(doc.rows);
	}).catch(function(err){
		console.log(err);
	});
};

function docsproduct(){
	product.allDocs({include_docs: true, descending: false}, function(err, doc){
		dproduct(doc.rows);
		awestransproduct(doc.rows);
	}).catch(function(err){
		console.log(err)
	});
};


// Display to browser
function dcustomer(data) {
	var customerList = document.getElementById('list-group-customer');
	customerList.innerHTML = "";
	data.forEach(function(data){
		customerList.appendChild(domCustomer(data.doc));
	})
}

function dproduct(data){
	var productList = document.getElementById('list-group-product');
	productList.innerHTML = "";
	data.forEach(function(data){
		productList.appendChild(domProduct(data.doc));
	})
}

// Create html to display for customers
function domCustomer(data){
	var list = document.createElement('li');
	
	// Total transactions
	var spanT = document.createElement('span');
	spanT.className = 'badge';
	spanT.innerHTML = '$ ' + data.total_transaction + ' sold';
	
	// Customer name
	var spanN = document.createElement('span');
	spanN.innerHTML = ' ' + data.customer_name;
	
	// Append
	list.appendChild(spanT);
	list.appendChild(spanN);
	list.className = 'list-group-item animated zoomInRight';
	return list
}

function domProduct(data){
	var list = document.createElement('li');

	// Stock left
	var spanS = document.createElement('span');
	spanS.className = 'badge';
	spanS.innerHTML = data.product_quantity + ' left';

	// Product name
	var spanN = document.createElement('span');
	spanN.innerHTML = data.product_name;

	list.appendChild(spanS);
	list.appendChild(spanN);
	list.className = 'list-group-item animated zoomInRight';
	return list
}

// Awesomeplete 
function awestransname(data){
	var awesname = document.getElementById('awes-trans-name');
	awesname.innerHTML = '';
	data.forEach(function(data){
		awesname.appendChild(awestransnameup(data.doc));
	});	
};

function awestransproduct(data){
	var awesproduct = document.getElementById('awes-trans-product');
	awesproduct.innerHTML = '';
	data.forEach(function(data){
		awesproduct.appendChild(awestransproductup(data.doc));
	});
};

function awestransnameup(data){
	var option = document.createElement('option');
	option.innerHTML = data.customer_name;
	return option
}

function awestransproductup(data){
	var option = document.createElement('option');
	option.innerHTML = data.product_name;
	return option
}


// Event listeners 
function awestransnameselect(value){
	index.createIndex({
	  index: {fields: ['customer_name']}
	}).then(function () {
	  return customer.find({
	    selector: {customer_name: {$eq: value}},
	    fields: ['_id', 'customer_name', 'last_transaction']
	  });
	}).then(function(result){
		var charging = document.getElementById('account-charging');
		var lastTrans = document.getElementById('account-last-transaction');
		charging.innerHTML = '';
		lastTrans.innerHTML = '';
		
		// Diplay name and set data-attribute to "_id"
		charging.innerHTML = 'You are charging ' + result.docs[0].customer_name;
		charging.setAttribute('data', result.docs[0]._id);
		
		// Display last transaction of the customer
		lastTrans.innerHTML = 'Last transaction: ' + result.docs[0].last_transaction;

	}).catch(function(err){	
			// Create new customer if there's no matching results
			var doc = {
								"_id": new Date().toISOString(),
								'customer_name': value,
								'last_transaction': new Date().toUTCString(),
								'date_created': new Date().toUTCString(),
								'total_transaction': 0
							};
							
							customer.put(doc).then(function(result){
									awestransnameselect(doc.customer_name)
							}).catch(function(err){
								console.log(err)
							});
	});
}

function awestransproductselect(value){
		index.createIndex({
	  index: {fields: ['product_name']}
	}).then(function () {
	  return product.find({
	    selector: {product_name: {$eq: value}},
	    fields: ['_id', 'product_name', 'product_price', 'product_quantity']
	  }).then(function(result){
	  	var transQty = document.getElementById('trans-quantity');
	  	transQty.value = "";
	  	transQty.value = result.docs[0].product_quantity;
	  });
	}).catch(function(err){
		console.log(err)
	})
}


function getprice(){
	var value  = document.getElementById('new-trans-product').value;
		index.createIndex({
	  index: {fields: ['product_name']}
	}).then(function () {
	  return product.find({
	    selector: {product_name: {$eq: value}},
	    fields: ['product_price', '_id']
	  }).then(function(result){
	  	console.log(result)
	  	var id = result.docs[0]._id
	  			price = parseInt(result.docs[0].product_price),
	  			quantity = parseInt(document.getElementById('trans-quantity').value),
	  			answer = price * quantity;
	  	    ;

	  	    transreceipt(answer, id);
	  	console.log()

	  });
	}).catch(function(err){
		console.log(err)
	})
}

function transreceipt(price, id){
	var awesname = document.getElementById('new-trans-name');
	var awesproduct = document.getElementById('new-trans-product');
	var awesquantity = document.getElementById('trans-quantity')
	var receiptList = document.getElementById('list-group-receipt');
	// Create new item in receipt
	var list = document.createElement('li'),
			spanB = document.createElement('span'),
			spanP = document.createElement('span')
			spanG = document.createElement('span'),
			del = document.createElement('a'),
			pName = document.createElement('span'),
			spanQ = document.createElement('span');
	spanB.className = 'badge';
	spanB.innerHTML = '$ ';
	spanP.className = 'list-price'
	spanP.innerHTML = price
	spanQ.className = 'badge';
	spanQ.innerHTML = awesquantity.value;
	spanG.className = 'glyphicon glyphicon-minus';
	del.className = 'text-warning';
	del.setAttribute('href', '#');
	del.addEventListener('click', deleteButtonPressed.bind(this, list));

	pName.innerHTML = ' ' + awesproduct.value; 
	spanB.appendChild(spanP)
	list.appendChild(spanB)
	list.appendChild(spanQ)
	list.appendChild(del)
	del.appendChild(spanG)
	list.appendChild(pName)
	list.className = 'list-group-item animated zoomInRight receipt'
	list.id = id;

	receiptList.appendChild(list)

	awesproduct.value = '';
	awesquantity.value = '';
	// Update the total amount to be payed 
	var amount = document.getElementById('account-new-amount'),
			add = parseInt(amount.innerHTML) + price;
	amount.innerHTML = add;
}

function deleteButtonPressed(data){
	var amount = document.getElementById('account-new-amount')
	var spanP = data.childNodes[0].childNodes[1].innerHTML;
	var minus = parseInt(amount.innerHTML) - parseInt(spanP)
	amount.innerHTML = minus;
	data.remove()
}

function transactionsend(){
	document.querySelectorAll('li.list-group-item.animated.zoomInRight.receipt').forEach(function(list){
		// Get customer info
		var customerN = document.getElementById('new-trans-name'),
				customerId = document.getElementById('account-charging');
		// Get information of each product in the transaction receipt
		var price = list.childNodes[0].childNodes[1].innerHTML, 
				quantity = list.childNodes[1],
				productN = list.childNodes[3];

		// Update customer record 
		customer.get(customerId.getAttribute('data')).then(function(doc){
			doc.last_transaction = new Date().toISOString();
			doc.total_transaction = parseInt(doc.total_transaction) + parseInt(price);
			return customer.put(doc)
		})


  	product.get(list.id).then(function(doc) {
			doc.product_quantity = parseInt(doc.product_quantity) - parseInt(quantity.innerHTML);
			return product.put(doc)
		}).then(function(){
			return product.get(list.id)
		}).then(function(doc){
			if (doc.product_quantity === '0' || doc.product_quantity === 0 || doc.product_quantity < 0 ) {
				return product.remove(doc)
			}
		});

	});

	document.getElementById('list-group-receipt').innerHTML = '';
	document.getElementById('new-trans-name').value = '';
	document.getElementById('account-new-amount').innerHTML = '0';

}

function transproductupdate(id, quanity) {
	product.get(id).then(function(doc){
		var current = doc.product_quantity,
				minus = parseInt(current) - quantity;
		doc.product_quantity = minus;
	}).catch(function(err){
		console.log(err)
	})
}
function start(){
	docscustomer();
	docsproduct();
}
start();