// Communication Network Model - vis-network MicroSim
// The same four weeks of messages modeled two ways:
//   left  = aggregate model   (one weighted COMMUNICATES_WITH edge per pair)
//   right = event-level model (one SENT_MESSAGE edge per message, with a timestamp)
// CANVAS_HEIGHT: 520
//
// Layout budget: title 30 + panels 356 + info bar 84 + gaps 6 + controls 44

// ===========================================
// ARIA COLOR SCHEME
// ===========================================
const INDIGO = '#303F9F';
const INDIGO_DARK = '#1A237E';
const AMBER = '#D4880F';
const AMBER_DARK = '#B06D0B';
const HOVER_COLOR = '#303F9F';

// ===========================================
// SAMPLE DATA
// Five employees, and four working weeks of messages between them.
// Week 1 starts on Monday 2025-09-08.
// ===========================================
// Going around the pentagon in this order keeps five of the six communicating
// pairs on the outside edge, so the aggregate edges never cross each other.
const employees = [
    { id: 'maria',  name: 'Maria',  fullName: 'Maria Chen',    title: 'Senior Engineer',     x: 0,    y: -122 },
    { id: 'james',  name: 'James',  fullName: 'James Park',    title: 'Engineering Manager', x: 128,  y: -28 },
    { id: 'aisha',  name: 'Aisha',  fullName: 'Aisha Patel',   title: 'Product Manager',     x: 82,   y: 118 },
    { id: 'li',     name: 'Li',     fullName: 'Li Wei',        title: 'Data Analyst',        x: -82,  y: 118 },
    { id: 'carlos', name: 'Carlos', fullName: 'Carlos Rivera', title: 'Lead Designer',       x: -128, y: -28 }
];

const employeeById = {};
employees.forEach(e => { employeeById[e.id] = e; });

// Each pair lists, for each of the four weeks, the weekdays (0 = Mon ... 4 = Fri)
// on which one message was exchanged. Channels cycle through the given list.
const pairs = [
    { a: 'maria',  b: 'james',  weeks: [[0, 1, 2, 3, 4], [0, 1, 2, 3, 4], [0, 1, 3, 4], [1, 3]],
      channels: ['chat', 'email', 'chat', 'meeting'] },
    { a: 'maria',  b: 'aisha',  weeks: [[], [2], [0, 2, 4], [0, 1, 2, 3, 4]],
      channels: ['email', 'chat', 'meeting'] },
    { a: 'aisha',  b: 'li',     weeks: [[1, 3], [1, 3], [1, 3], [1, 3]],
      channels: ['chat', 'email'] },
    { a: 'maria',  b: 'carlos', weeks: [[2], [2], [2], [2]],
      channels: ['meeting', 'chat'] },
    { a: 'james',  b: 'aisha',  weeks: [[4], [], [4], []],
      channels: ['email'] },
    { a: 'carlos', b: 'li',     weeks: [[], [3], [], []],
      channels: ['email'] }
];

const NUM_WEEKS = 4;
const START_UTC = Date.UTC(2025, 8, 8);   // Monday 8 September 2025
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function pad(n) {
    return (n < 10 ? '0' : '') + n;
}

function dayDate(week, day) {
    return new Date(START_UTC + (week * 7 + day) * 86400000);
}

function isoDate(d) {
    return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate());
}

function shortDate(d) {
    return MONTHS[d.getUTCMonth()] + ' ' + d.getUTCDate();
}

function weekLabel(week) {
    return shortDate(dayDate(week, 0)) + ' - ' + shortDate(dayDate(week, 4));
}

// Build the list of individual message events
const events = [];
pairs.forEach((pair, pairIndex) => {
    let k = 0;
    pair.weeks.forEach((days, week) => {
        days.forEach(day => {
            const d = dayDate(week, day);
            const hour = 9 + ((k * 3 + pairIndex) % 8);
            const minute = (k * 17 + pairIndex * 7) % 60;
            const senderIsA = (k % 2 === 0);
            events.push({
                id: 'evt-' + pairIndex + '-' + k,
                pairIndex: pairIndex,
                week: week,
                from: senderIsA ? pair.a : pair.b,
                to: senderIsA ? pair.b : pair.a,
                date: isoDate(d),
                timestamp: isoDate(d) + 'T' + pad(hour) + ':' + pad(minute) + ':00',
                channel: pair.channels[k % pair.channels.length]
            });
            k++;
        });
    });
});

// Roll the events up into one aggregate edge per pair.
// The chapter's Cypher uses message_count thresholds of 200 / 50 / 12 over a
// full message history. This four-week sample scales the same idea to
// messages per week: 4 or more = daily, 1 or more = weekly, otherwise monthly.
function frequencyFor(count) {
    const perWeek = count / NUM_WEEKS;
    if (perWeek >= 4) return 'daily';
    if (perWeek >= 1) return 'weekly';
    return 'monthly';
}

const aggregates = pairs.map((pair, pairIndex) => {
    const mine = events.filter(e => e.pairIndex === pairIndex);
    const channelCounts = {};
    mine.forEach(e => { channelCounts[e.channel] = (channelCounts[e.channel] || 0) + 1; });
    return {
        id: 'agg-' + pairIndex,
        pairIndex: pairIndex,
        a: pair.a,
        b: pair.b,
        message_count: mine.length,
        frequency: frequencyFor(mine.length),
        channelCounts: channelCounts,
        first_contact: mine[0].date,
        last_contact: mine[mine.length - 1].date
    };
});

function channelBreakdown(counts) {
    return Object.keys(counts).map(c => c + ' ' + counts[c]).join(', ');
}

function pairName(pairIndex, separator) {
    const p = pairs[pairIndex];
    return employeeById[p.a].name + separator + employeeById[p.b].name;
}

// ===========================================
// SHARED NETWORK SETTINGS
// ===========================================
function makeNodes() {
    return new vis.DataSet(employees.map(e => ({
        id: e.id,
        label: e.name,
        x: e.x,
        y: e.y,
        fixed: true,
        shape: 'circle',
        widthConstraint: { minimum: 46, maximum: 46 },
        borderWidth: 2,
        color: {
            background: AMBER, border: AMBER_DARK,
            highlight: { background: AMBER, border: INDIGO_DARK },
            hover: { background: '#E09A2B', border: INDIGO_DARK }
        },
        font: { color: '#FFFFFF', size: 13, face: 'Arial', bold: true },
        shadow: { enabled: true, color: 'rgba(0,0,0,0.2)', size: 5, x: 1, y: 1 }
    })));
}

// The two small graphs always fit their panels, so zooming, panning and the
// navigation buttons are switched off. Nothing here captures page scrolling.
const options = {
    physics: { enabled: false },
    interaction: {
        hover: true,
        tooltipDelay: 120,
        dragNodes: false,
        dragView: false,
        zoomView: false,
        selectable: false,
        navigationButtons: false
    }
};

function tooltip(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div;
}

// ===========================================
// AGGREGATE MODEL (left)
// ===========================================
function aggregateTooltip(agg) {
    return tooltip(
        '<b>COMMUNICATES_WITH</b><br>' +
        'message_count: ' + agg.message_count + '<br>' +
        "frequency: '" + agg.frequency + "'<br>" +
        'channels: ' + channelBreakdown(agg.channelCounts)
    );
}

const aggEdges = new vis.DataSet(aggregates.map(agg => ({
    id: agg.id,
    from: agg.a,
    to: agg.b,
    label: agg.frequency + ' (' + agg.message_count + ')',
    title: aggregateTooltip(agg),
    width: 1.5 + agg.message_count * 0.6,       // thickness shows message_count
    hoverWidth: 0,
    color: { color: AMBER, hover: HOVER_COLOR, highlight: HOVER_COLOR },
    font: { size: 12, color: '#222222', strokeWidth: 0, background: '#FFFFFF', align: 'horizontal' },
    smooth: false
})));

const aggNetwork = new vis.Network(
    document.getElementById('network-agg'),
    { nodes: makeNodes(), edges: aggEdges },
    options
);

// ===========================================
// EVENT-LEVEL MODEL (right)
// ===========================================
let currentWindow = 0;     // 0 = all weeks, 1..4 = a single week

function eventsInWindow() {
    if (currentWindow === 0) return events;
    return events.filter(e => e.week === currentWindow - 1);
}

function eventTooltip(evt) {
    return tooltip(
        '<b>SENT_MESSAGE</b><br>' +
        'timestamp: ' + evt.timestamp + '<br>' +
        "channel: '" + evt.channel + "'"
    );
}

// Parallel edges between the same two people are fanned out as arcs so that
// every message stays visible as its own edge.
function buildEventEdges() {
    const visible = eventsInWindow();
    const result = [];
    pairs.forEach((pair, pairIndex) => {
        const mine = visible.filter(e => e.pairIndex === pairIndex);
        const n = mine.length;
        const spread = Math.min(0.4, 0.07 * n);
        mine.forEach((evt, i) => {
            // offset runs from -spread to +spread across the fan
            const offset = (n === 1) ? 0 : -spread + (2 * spread * i) / (n - 1);
            let smooth;
            if (Math.abs(offset) < 0.001) {
                smooth = false;
            } else {
                // Curve side is defined for the a -> b direction; flip it for b -> a
                let clockwise = offset > 0;
                if (evt.from !== pair.a) clockwise = !clockwise;
                smooth = { enabled: true, type: clockwise ? 'curvedCW' : 'curvedCCW', roundness: Math.abs(offset) };
            }
            result.push({
                id: evt.id,
                from: evt.from,
                to: evt.to,
                title: eventTooltip(evt),
                width: 1.3,
                hoverWidth: 2.2,
                dashes: [5, 4],
                color: { color: AMBER, hover: HOVER_COLOR, highlight: HOVER_COLOR },
                arrows: { to: { enabled: true, scaleFactor: 0.45 } },
                smooth: smooth
            });
        });
    });
    return result;
}

const evtEdges = new vis.DataSet(buildEventEdges());

const evtNetwork = new vis.Network(
    document.getElementById('network-evt'),
    { nodes: makeNodes(), edges: evtEdges },
    options
);

// Fit a network to its panel, then shrink it slightly and nudge it upward so
// the fanned-out arcs and the note along the bottom edge both have room.
function fitNetwork(network) {
    network.fit({ animation: false });
    // (the bottom notes are hidden on narrow screens, so less shrinking is needed)
    const shrink = (window.innerWidth < 600) ? 0.97 : 0.86;
    const scale = network.getScale() * shrink;
    const pos = network.getViewPosition();
    network.moveTo({
        position: { x: pos.x, y: pos.y + 9 / scale },   // camera down = graph up
        scale: scale,
        animation: false
    });
}

function fitBoth() {
    aggNetwork.redraw();
    evtNetwork.redraw();
    fitNetwork(aggNetwork);
    fitNetwork(evtNetwork);
}

aggNetwork.once('afterDrawing', function () { fitNetwork(aggNetwork); });
evtNetwork.once('afterDrawing', function () { fitNetwork(evtNetwork); });
window.addEventListener('resize', fitBoth);

// ===========================================
// INFO BAR
// ===========================================
const infoBar = document.getElementById('info-bar');

function windowName() {
    if (currentWindow === 0) return 'All 4 weeks';
    return 'Week ' + currentWindow + ' (' + weekLabel(currentWindow - 1) + ')';
}

function showDefaultInfo() {
    const visible = eventsInWindow();
    if (currentWindow === 0) {
        infoBar.innerHTML =
            '<span class="info-title">Same ' + events.length + ' messages, two models.</span> ' +
            'The aggregate model answers <i>who talks to whom, and how much?</i> with ' + aggregates.length +
            ' weighted edges. The event-level model keeps one timestamped edge per message, so it can also answer ' +
            '<i>when?</i> Hover any edge to compare its properties, then move the Time Window slider.';
        return;
    }
    let counts = '';
    pairs.forEach((pair, pairIndex) => {
        const n = visible.filter(e => e.pairIndex === pairIndex).length;
        counts += '<span class="pair-count">' + pairName(pairIndex, '–') + ' <b>' + n + '</b></span>';
    });
    infoBar.innerHTML =
        '<span class="info-title">' + windowName() + ': ' + visible.length + ' messages.</span><br>' +
        counts + '<br>' +
        'Only the event-level model can produce these weekly counts. The aggregate edges report the same totals for every week.';
}

function showAggregateInfo(agg) {
    infoBar.innerHTML =
        '<span class="info-title">Aggregate edge:</span> ' +
        '<code>(' + employeeById[agg.a].name + ')-[:COMMUNICATES_WITH]-(' + employeeById[agg.b].name + ')</code><br>' +
        '<code>message_count: ' + agg.message_count + '</code> &nbsp; ' +
        "<code>frequency: '" + agg.frequency + "'</code> &nbsp; " +
        '<code>channels: ' + channelBreakdown(agg.channelCounts) + '</code><br>' +
        '<code>first_contact: ' + agg.first_contact + '</code> &nbsp; ' +
        '<code>last_contact: ' + agg.last_contact + '</code> &nbsp; One edge summarizes ' +
        agg.message_count + (agg.message_count === 1 ? ' message.' : ' messages.');
}

function showEventInfo(evt) {
    const sameWindow = eventsInWindow().filter(e => e.pairIndex === evt.pairIndex).length;
    infoBar.innerHTML =
        '<span class="info-title">Event edge:</span> ' +
        '<code>(' + employeeById[evt.from].name + ')-[:SENT_MESSAGE]-&gt;(' + employeeById[evt.to].name + ')</code><br>' +
        '<code>timestamp: ' + evt.timestamp + '</code> &nbsp; ' +
        "<code>channel: '" + evt.channel + "'</code> &nbsp; " +
        "<code>direction: 'outbound'</code><br>" +
        'One of ' + sameWindow + ' message edges between ' + pairName(evt.pairIndex, ' and ') +
        ' in this time window.';
}

function showEmployeeInfo(id) {
    const e = employeeById[id];
    const n = eventsInWindow().filter(evt => evt.from === id || evt.to === id).length;
    infoBar.innerHTML =
        '<span class="info-title">' + e.fullName + '</span> &mdash; ' + e.title + '<br>' +
        'Sent or received <b>' + n + '</b> messages in this time window (' + windowName() + ').<br>' +
        'The same :Employee node appears in both models. Only the edges differ.';
}

aggNetwork.on('hoverEdge', function (params) {
    const agg = aggregates.find(a => a.id === params.edge);
    if (agg) showAggregateInfo(agg);
});
aggNetwork.on('blurEdge', showDefaultInfo);
aggNetwork.on('hoverNode', function (params) { showEmployeeInfo(params.node); });
aggNetwork.on('blurNode', showDefaultInfo);

evtNetwork.on('hoverEdge', function (params) {
    const evt = events.find(e => e.id === params.edge);
    if (evt) showEventInfo(evt);
});
evtNetwork.on('blurEdge', showDefaultInfo);
evtNetwork.on('hoverNode', function (params) { showEmployeeInfo(params.node); });
evtNetwork.on('blurNode', showDefaultInfo);

// ===========================================
// CONTROLS
// ===========================================
const showCountBox = document.getElementById('show-count');
const windowSlider = document.getElementById('time-window');
const windowValue = document.getElementById('window-value');
const aggCount = document.getElementById('agg-count');
const evtCount = document.getElementById('evt-count');
const aggNote = document.getElementById('agg-note');
const evtNote = document.getElementById('evt-note');

function updateCounts() {
    const shown = eventsInWindow().length;
    aggCount.textContent = aggregates.length + ' edges';
    evtCount.textContent = (currentWindow === 0)
        ? events.length + ' edges'
        : shown + ' of ' + events.length + ' edges';
    aggCount.classList.toggle('visible', showCountBox.checked);
    evtCount.classList.toggle('visible', showCountBox.checked);
}

function updateNotes() {
    if (currentWindow === 0) {
        aggNote.className = 'panel-note';
        aggNote.textContent = 'Edge thickness = message_count';
        evtNote.textContent = 'Each dashed arrow = one message';
    } else {
        aggNote.className = 'panel-note alert';
        aggNote.textContent = 'No timestamps on these edges: no weekly filter.';
        evtNote.textContent = 'Showing ' + windowName();
    }
}

function setWindow(value) {
    currentWindow = value;
    // On narrow screens the date range is left out so the slider keeps its width
    const narrow = window.innerWidth < 600;
    windowValue.textContent = (value === 0) ? 'All 4 weeks'
        : 'Week ' + value + (narrow ? '' : ' (' + weekLabel(value - 1) + ')');
    evtEdges.clear();
    evtEdges.add(buildEventEdges());
    updateCounts();
    updateNotes();
    showDefaultInfo();
}

windowSlider.addEventListener('input', function () {
    setWindow(parseInt(windowSlider.value, 10));
});
showCountBox.addEventListener('change', updateCounts);

setWindow(0);
