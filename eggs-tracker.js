var initialEggData = JSON.stringify({
		'lines' : [
			{
				'total' : 619,
				'history' : true
			},
			{
				'total' : 663,
				'ten' : 8,
				'history' : true
			},
			{
				'total' : 702,
				'two' : 19,
				'five' : 15,
				'ten' : 5,
				'history' : false,
				'since' : '2017-05-08'
			}
		]
	}),
	
	initialTotals = {
		'two' : -1,
		'five' : -1, 
		'ten' : -1
	},
	
	totals = {
		'two' : 0,
		'five' : 0, 
		'ten' : 0
	},
		
	trIdPlaceholder = '%%tr_id%%',
	
	trClassPlaceholder = '%%tr_class%%',
	
	totalIdPlaceholder = '%%total_id%%',
	
	totalPlaceholder = '%%total%%',
	
	sincePlaceholder = '%%since%%',
	
	twoColumnPlaceholder = '%%2k%%',
	
	fiveColumnPlaceholder = '%%5k%%',
	
	tenColumnPlaceholder = '%%10k%%',
	
	rowTemplate = '<tr id="%%tr_id%%" class="%%tr_class%%"><td class="narrow total"><div id="%%total_id%%">%%total%%</div><div class="date">%%since%%</div></td> <td type="two">%%2k%%</td> <td type="five">%%5k%%</td> <td type="ten">%%10k%%</td> </tr>',
	
	valuePlaceholder = '%%value%%',
	
	percentagePlaceholder = '%%percentage%%',
	
	inputIdPlaceholder = '%%input_id%%',
	
	percentageIdPlaceHolder = '%%percentage_id%%',
	
	inactiveColumnTemplate = '<div> <input id="%%input_id%%" value="%%value%%" disabled/> </div> <div id="%%percentage_id%%">%%percentage%%%</div>',
	
	activeColumnTemplate = '<div> <button class="minus">-</button> <input id="%%input_id%%" value="%%value%%" disabled/> <button class="plus">+</button> </div> <div id="%%percentage_id%%">%%percentage%%%</div>',
	
	eggData,
	
	processEggData = function() {
		var table = $('#table');
			
		for (var i = 0; i < eggData.lines.length; i++) {
			var row = rowTemplate, 
				line = eggData.lines[i],
				columns = {};
				
			$.each([ 'two', 'five', 'ten' ], function( index, value ) {
  				if (typeof line[value] === 'undefined') {
					columns[value] = '';
				} else {
					if (initialTotals[value] === -1) {
						initialTotals[value] = eggData.lines[i -1].total;
					}
					totals[value] += line[value];
					if (line.history === true) {
						columns[value] = createColumn(inactiveColumnTemplate, value, i);
					} else {
						columns[value] = createColumn(activeColumnTemplate, value, i);
					}
				}
			});
				
			row = row.replace(trIdPlaceholder, i);
			row = row.replace(trClassPlaceholder, line.history ===true ? 'history' : '');
			row = row.replace(totalIdPlaceholder, i + '-total');
			row = row.replace(totalPlaceholder, line.total);
			row = row.replace(sincePlaceholder, typeof line.since === 'undefined' ? '' : line.since);
			row = row.replace(twoColumnPlaceholder, columns['two']);
			row = row.replace(fiveColumnPlaceholder, columns['five']);
			row = row.replace(tenColumnPlaceholder, columns['ten']);
			
			table.append(row);
		}
		
		table.append(createSummaryRow(eggData.lines[eggData.lines.length - 1].total, totals));
	},
	
	createColumn = function( columnTemplate, type, index ) {
		var column = columnTemplate,
			total = eggData.lines[index].total,
			prevTotal = index > 0 ? eggData.lines[index-1].total : 0,
			value;
		
		switch(type) {
    		case 'two':
        		value = eggData.lines[index].two;
        		break;
    		case 'five':
        		value = eggData.lines[index].five;
        		break;
        	case 'ten':
        		value = eggData.lines[index].ten;
        		break;
    		default:
        		value = 0;
		}
		
		return fillColumn(columnTemplate, index + '-' + type + '-value', value, index + '-' + type + '-percentage', value === 0 ? 0 : parseFloat(value * 100 / (total - prevTotal)).toFixed(2));
	},
	
	createSummaryRow = function( total, totals ) {
		var row = rowTemplate;
		
		row = row.replace(trIdPlaceholder, '');
		row = row.replace(trClassPlaceholder, '');
		row = row.replace(totalIdPlaceholder, '');
		row = row.replace(totalPlaceholder, 'Summary');
		row = row.replace(sincePlaceholder, '');
		row = row.replace(twoColumnPlaceholder, fillColumn(inactiveColumnTemplate, 'summary-two-value', totals['two'], 'summary-two-percentage', parseFloat(totals['two'] * 100 / (total - initialTotals['two'])).toFixed(2)));
		row = row.replace(fiveColumnPlaceholder, fillColumn(inactiveColumnTemplate, 'summary-five-value', totals['five'], 'summary-five-percentage', parseFloat(totals['five'] * 100 / (total - initialTotals['five'])).toFixed(2)));
		row = row.replace(tenColumnPlaceholder, fillColumn(inactiveColumnTemplate, 'summary-ten-value', totals['ten'], 'summary-ten-percentage', parseFloat(totals['ten'] * 100 / (total - initialTotals['ten'])).toFixed(2)));
		
		return row;
	},
	
	fillColumn = function( columnTemplate, inputId, value, percentageId, percentage ) {
		var column = columnTemplate;
		
		column = column.replace(inputIdPlaceholder, inputId);
		column = column.replace(valuePlaceholder, value);
		column = column.replace(percentageIdPlaceHolder, percentageId);
		column = column.replace(percentagePlaceholder, percentage);
		
		return column;
	},
	
	increment = function() {
		var index = $(this).parent().parent().parent().attr('id'),
			type = $(this).parent().parent().attr('type'), 
			line = eggData.lines[index];
		
		line[type]++;
		line.total++;
		totals[type]++;
		
		update(index, line, type);
		localStorage.setItem('eggData', JSON.stringify(eggData));
	},
	
	decrement = function() {
		var index = $(this).parent().parent().parent().attr('id'),
			type = $(this).parent().parent().attr('type'), 
			line = eggData.lines[index];
			
		if (line[type] - 1 >=0) {
			--line[type];
		}
		if (line.total - 1 >=0) {
			--line.total;
		}
		if (totals[type] - 1 >= 0) {
			--totals[type];
		}
		
		update(index, line, type);
		localStorage.setItem('eggData', JSON.stringify(eggData));
	},
	
	update = function( index, line, type ) {
		var prevTotal = index > 0 ? eggData.lines[index - 1].total : 0;
		$('#' + index + '-' + type + '-value').val(line[type]);
		$('#' + index + '-total').html(line.total);
		$('#' + index + '-two-percentage').html(parseFloat(line.two * 100 / (line.total - prevTotal)).toFixed(2) + '%');
		$('#' + index + '-five-percentage').html(parseFloat(line.five * 100 / (line.total - prevTotal)).toFixed(2) + '%');
		$('#' + index + '-ten-percentage').html(parseFloat(line.ten * 100 / (line.total - prevTotal)).toFixed(2) + '%');
		
		updateSummaryRow(index, line, type);
	},
	
	updateSummaryRow = function( index, line, type ) {
		var total = eggData.lines[eggData.lines.length - 1].total;
		$('#summary-' + type + '-value').val(totals[type]);
		$('#summary-two-percentage').html(parseFloat(totals['two'] * 100 / (total - initialTotals['two'])).toFixed(2) + '%');
		$('#summary-five-percentage').html(parseFloat(totals['five'] * 100 / (total - initialTotals['five'])).toFixed(2) + '%');
		$('#summary-ten-percentage').html(parseFloat(totals['ten'] * 100 / (total - initialTotals['ten'])).toFixed(2) + '%');
	};	

$(document).ready(function() {
	localStorage.setItem('eggData', initialEggData);
	if (typeof(Storage) !== 'undefined') {
		if (localStorage.getItem('eggData') !== null) {
			eggData = JSON.parse(localStorage.getItem('eggData'));
		} else {
			localStorage.setItem('eggData', initialEggData);
			eggData = JSON.parse(initialEggData);
		}
		processEggData();
		$('.plus').on('click', increment); 
		$('.minus').on('click', decrement);
	} else {
		alert('Storage is not supported in your browser');
	}
});

$('#new-line').on('click', function() {
	var table = $('#table');
		lastRowIndex = eggData.lines.length - 1,
		lastRow = $('#' + lastRowIndex),
		newRow = rowTemplate, 
		newRowIndex = lastRowIndex + 1,
		newLine = {
			'total' : eggData.lines[lastRowIndex].total,
			'two' : 0,
			'five' : 0,
			'ten' : 0,
			'history' : false,
			'since' : new Date().toISOString().slice(0,10)
		};
		
	lastRow.addClass('history');
	lastRow.find('button').remove();
	eggData.lines[lastRowIndex].history = true;
	eggData.lines.push(newLine);
	
	newRow = newRow.replace(trIdPlaceholder, newRowIndex);
	newRow = newRow.replace(trClassPlaceholder,  '');
	newRow = newRow.replace(totalIdPlaceholder, newRowIndex + '-total');
	newRow = newRow.replace(totalPlaceholder, newLine.total);
	newRow = newRow.replace(sincePlaceholder, newLine.since);
	newRow = newRow.replace(twoColumnPlaceholder, createColumn(activeColumnTemplate, 'two', newRowIndex));
	newRow = newRow.replace(fiveColumnPlaceholder, createColumn(activeColumnTemplate, 'five', newRowIndex));
	newRow = newRow.replace(tenColumnPlaceholder, createColumn(activeColumnTemplate, 'ten', newRowIndex));	
	
	lastRow.after(newRow);
	
	$('.plus').on('click', increment); 
	$('.minus').on('click', decrement);
	
	localStorage.setItem('eggData', JSON.stringify(eggData));
});

$('#reset').on('click', function() {
	confirm.display();
	
	$('#yes').on('click', function() {
		confirm.destroy();
		localStorage.setItem('eggData', initialEggData);
		location.reload();
	});
	
	$('#no').on('click', function() {
		confirm.destroy();
	});
});
