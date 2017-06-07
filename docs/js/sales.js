function salesDocs(){
	sales.allDocs({include_docs: true, descending: false}, function(err, doc){
		recentTrans(doc.rows)
		totalTrans(doc.rows)
	});
};

function totalTrans(data){
	data.forEach(function(data){
		recentTotal(data.doc)
	});
}

function recentTotal(data){
	var span = document.querySelector('span#totalSales');
	total = parseInt(span.innerHTML);
	amount = parseInt(data.total)
	span.innerHTML = total + amount + ' Php';
}

function recentTrans(data){
	var displayTrans = document.querySelector('ul#displayTrans');
	displayTrans.innerHTML = '';
	data.forEach(function(data){
		var displayTrans = document.querySelector('ul#displayTrans');
		displayTrans.appendChild(transaction(data.doc));
	});
}

function transaction(data){
		var li = document.createElement('li');
		var collapsible = document.createElement('div');
		var badge = document.createElement('span');
		var account = document.createElement('span');

		collapsible.className = 'collapsible-header';
		badge.className = 'badge green';
		badge.setAttribute('style', 'font-size: 0.8rem; border-radius: 2px; color: white;')
		badge.innerHTML = data.total + ' Php';
		account.innerHTML = data._id;

		li.appendChild(collapsible);
		collapsible.appendChild(badge);
		collapsible.appendChild(account);
		return li;
}

function salesAccountDocs(){
	account.allDocs({include_docs: true, descending: false}, function(err, doc){
		totalAccounts(data.rows)
	});
};

salesDocs();