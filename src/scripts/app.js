if (typeof mermaid !== 'undefined') {
    mermaid.initialize({ startOnLoad: false });
}

// Predefined scatter positions (up to 5 points) within each quadrant.
// Index corresponds to the count of traits (1–5) selected.
var ARENA_POSITIONS = [
    [[0.75, 0.75]],
    [[0.65, 0.78], [0.87, 0.78]],
    [[0.6, 0.83], [0.75, 0.63], [0.9, 0.83]],
    [[0.62, 0.87], [0.87, 0.87], [0.62, 0.62], [0.87, 0.62]],
    [[0.58, 0.87], [0.73, 0.87], [0.88, 0.87], [0.65, 0.62], [0.85, 0.62]]
];

var BLIND_POSITIONS = [
    [[0.25, 0.75]],
    [[0.13, 0.78], [0.37, 0.78]],
    [[0.1, 0.83], [0.25, 0.63], [0.42, 0.83]],
    [[0.12, 0.87], [0.38, 0.87], [0.12, 0.62], [0.38, 0.62]],
    [[0.08, 0.87], [0.23, 0.87], [0.38, 0.87], [0.15, 0.62], [0.35, 0.62]]
];

var chartRenderCount = 0;

function buildChartDefinition(johariTraits, nohariTraits) {
    var lines = [
        'quadrantChart',
        '    title Johari Window',
        '    x-axis Not Known to Self --> Known to Self',
        '    y-axis Not Known to Others --> Known to Others',
        '    quadrant-1 Arena',
        '    quadrant-2 Blind Spot',
        '    quadrant-3 Unknown',
        '    quadrant-4 Facade'
    ];

    if (johariTraits.length > 0) {
        var arenaCount = Math.min(johariTraits.length, ARENA_POSITIONS.length);
        var arenaPos = ARENA_POSITIONS[arenaCount - 1];
        johariTraits.slice(0, arenaCount).forEach(function(trait, i) {
            var pos = arenaPos[i];
            lines.push('    ' + trait + ': [' + pos[0] + ', ' + pos[1] + ']');
        });
    }

    if (nohariTraits.length > 0) {
        var blindCount = Math.min(nohariTraits.length, BLIND_POSITIONS.length);
        var blindPos = BLIND_POSITIONS[blindCount - 1];
        nohariTraits.slice(0, blindCount).forEach(function(trait, i) {
            var pos = blindPos[i];
            lines.push('    ' + trait + ': [' + pos[0] + ', ' + pos[1] + ']');
        });
    }

    return lines.join('\n');
}

function renderChart(johariTraits, nohariTraits) {
    if (typeof mermaid === 'undefined') { return; }
    chartRenderCount++;
    var chartId = 'johariChart' + chartRenderCount;
    var chartDef = buildChartDefinition(johariTraits, nohariTraits);
    mermaid.render(chartId, chartDef).then(function(result) {
        document.getElementById('mermaidChart').innerHTML = result.svg;
        document.getElementById('chartContainer').style.display = 'block';
    }).catch(function(err) {
        console.error('Chart render error:', err);
    });
}

function handleTraitClick(tableId, e) {
    var $cell = $(e.currentTarget);
    var classList = $cell.attr("class");
    var className = "selected";
    var rowCount = $('table#' + tableId + ' > tbody > tr > td.selected').length;

    if (rowCount < 5) {
        $cell.toggleClass(className);
    } else if (classList && classList.includes(className)) {
        $cell.toggleClass(className);
    }

    e.stopPropagation();
}

$("#tableJohari tr td").click(function(e) {
    handleTraitClick("tableJohari", e);
});

$("#tableNohari tr td").click(function(e) {
    handleTraitClick("tableNohari", e);
});

function calculateWindow() {
    // Johari (positive) traits selected by the user represent what is Known to Self
    var johariTraits = [];
    $('table#tableJohari > tbody > tr > td.selected').each(function() {
        johariTraits.push($(this).text().trim());
    });

    // Nohari (negative) traits selected represent blind spots — Known to Others but not to Self
    var nohariTraits = [];
    $('table#tableNohari > tbody > tr > td.selected').each(function() {
        nohariTraits.push($(this).text().trim());
    });

    var johariCount = johariTraits.length; // 0–5
    var nohariCount = nohariTraits.length; // 0–5

    // Proportions: clamp to 10–90% so every quadrant remains visible
    var selfPct    = Math.max(10, Math.min(90, (johariCount / 5) * 100));
    var notSelfPct = 100 - selfPct;
    var othersPct    = Math.max(10, Math.min(90, (nohariCount / 5) * 100));
    var notOthersPct = 100 - othersPct;

    // Populate Arena quadrant with Johari (positive) traits
    var $arenaList = $('#arenaTraits').empty();
    johariTraits.forEach(function(trait) {
        $arenaList.append('<li>' + trait + '</li>');
    });

    // Populate Blind Spot quadrant with Nohari (negative) traits
    var $blindList = $('#blindTraits').empty();
    nohariTraits.forEach(function(trait) {
        $blindList.append('<li>' + trait + '</li>');
    });

    // Reveal the outcome chart so the table has a rendered width
    $('#outcome').show();

    // Label column width (matches the fixed width set in CSS for axis-label cells)
    var LABEL_WIDTH_PX = 120;
    // Chart body height: total chart height (400px) minus the header row (40px)
    var CHART_HEADER_PX = $('#rowHeader').outerHeight();
    var CHART_TOTAL_PX  = $('#outcomeChart').outerHeight();
    var contentHeight   = CHART_TOTAL_PX - CHART_HEADER_PX;

    // Apply column widths using the actual rendered table width
    var contentWidth = $('#outcomeChart').width() - LABEL_WIDTH_PX;
    $('#colLabel').css('width', LABEL_WIDTH_PX + 'px');
    $('#colKnownSelf').css('width', Math.round(selfPct / 100 * contentWidth) + 'px');
    $('#colNotKnownSelf').css('width', Math.round(notSelfPct / 100 * contentWidth) + 'px');

    // Apply row heights proportionally within the chart body
    $('#rowKnownOthers').css('height', Math.round(othersPct / 100 * contentHeight) + 'px');
    $('#rowNotKnownOthers').css('height', Math.round(notOthersPct / 100 * contentHeight) + 'px');

    // Scroll to outcome
    $('html, body').animate({ scrollTop: $('#outcome').offset().top }, 500);

    renderChart(johariTraits, nohariTraits);
}

$('#calculateBtn').click(calculateWindow);