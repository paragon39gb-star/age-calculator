// script.js
(function() {
    const fromDate = document.getElementById('fromDate');
    const toDate = document.getElementById('toDate');
    const liveBadge = document.getElementById('liveBadge');
    const copyBtn = document.getElementById('copyBtn');
    const shareBtn = document.getElementById('shareBtn');
    const resetBtn = document.getElementById('resetBtn');

    const valYears = document.getElementById('valYears');
    const valMonths = document.getElementById('valMonths');
    const valWeeks = document.getElementById('valWeeks');
    const valDays = document.getElementById('valDays');
    const valHours = document.getElementById('valHours');
    const valMinutes = document.getElementById('valMinutes');
    const valSeconds = document.getElementById('valSeconds');
    const totalMonthsEl = document.getElementById('totalMonths');
    const totalDaysEl = document.getElementById('totalDays');
    const totalHoursEl = document.getElementById('totalHours');
    const secondsCard = document.getElementById('secondsCard');
    const allCards = document.querySelectorAll('.stat-card, .total-card');

    let currentDiff = null;
    let liveInterval = null;
    let isLiveActive = false;

    function fmt(n) {
        if (n === null || n === undefined || isNaN(n)) return '—';
        return n.toLocaleString('en-US');
    }

    function computeDiff(start, end) {
        if (start > end) return null;
        const msDiff = end.getTime() - start.getTime();

        let years = end.getFullYear() - start.getFullYear();
        let months = end.getMonth() - start.getMonth();
        let days = end.getDate() - start.getDate();
        let hours = end.getHours() - start.getHours();
        let minutes = end.getMinutes() - start.getMinutes();
        let seconds = end.getSeconds() - start.getSeconds();

        if (seconds < 0) { seconds += 60; minutes--; }
        if (minutes < 0) { minutes += 60; hours--; }
        if (hours < 0) { hours += 24; days--; }
        if (days < 0) {
            const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0);
            days += prevMonth.getDate();
            months--;
        }
        if (months < 0) { months += 12; years--; }
        if (years < 0) return null;

        const totalDays = Math.floor(msDiff / 86400000);
        const totalHours = Math.floor(msDiff / 3600000);
        const totalMonths = years * 12 + months;
        const weeks = Math.floor(days / 7);
        const remainingDays = days % 7;

        return { years, months, weeks, days: remainingDays, hours, minutes, seconds, totalDays, totalHours, totalMonths };
    }

    function updateUI(diff) {
        if (!diff) {
            clearDisplay();
            return;
        }
        setValue(valYears, diff.years);
        setValue(valMonths, diff.months);
        setValue(valWeeks, diff.weeks);
        setValue(valDays, diff.days);
        setValue(valHours, diff.hours);
        setValue(valMinutes, diff.minutes);
        setValueAnimated(valSeconds, diff.seconds);
        totalMonthsEl.textContent = fmt(diff.totalMonths);
        totalDaysEl.textContent = fmt(diff.totalDays);
        totalHoursEl.textContent = fmt(diff.totalHours);
        secondsCard.classList.add('live-glow');
        removeNoData();
        currentDiff = diff;
    }

    function setValue(el, val) {
        const str = fmt(val);
        if (el.textContent !== str) {
            el.textContent = str;
            el.style.transform = 'scale(1.1)';
            setTimeout(() => el.style.transform = 'scale(1)', 120);
        }
    }

    function setValueAnimated(el, val) {
        const str = fmt(val);
        if (el.textContent !== str) {
            el.textContent = str;
            el.style.transform = 'scale(1.2)';
            setTimeout(() => el.style.transform = 'scale(1)', 100);
        }
    }

    function clearDisplay() {
        [valYears, valMonths, valWeeks, valDays, valHours, valMinutes, valSeconds].forEach(el => {
            el.textContent = '—';
            el.style.transform = 'scale(1)';
        });
        totalMonthsEl.textContent = '—';
        totalDaysEl.textContent = '—';
        totalHoursEl.textContent = '—';
        secondsCard.classList.remove('live-glow');
        allCards.forEach(c => c.classList.add('no-data'));
        currentDiff = null;
    }

    function removeNoData() {
        allCards.forEach(c => c.classList.remove('no-data'));
    }

    function getParams() {
        const fromVal = fromDate.value;
        if (!fromVal) return null;
        const [fy, fm, fd] = fromVal.split('-').map(Number);
        const start = new Date(fy, fm - 1, fd, 0, 0, 0);

        const toVal = toDate.value;
        if (!toVal) return null;
        const now = new Date();
        const todayStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;

        if (toVal === todayStr) {
            return { start, end: new Date(), live: true };
        } else {
            const [ty, tm, td] = toVal.split('-').map(Number);
            return { start, end: new Date(ty, tm - 1, td, 0, 0, 0), live: false };
        }
    }

    function tick() {
        const params = getParams();
        if (!params) {
            clearDisplay();
            stopLive();
            return;
        }
        const diff = computeDiff(params.start, params.end);
        updateUI(diff);

        if (params.live) {
            if (!isLiveActive) startLive();
            liveBadge.style.display = 'inline-flex';
        } else {
            if (isLiveActive) stopLive();
            liveBadge.style.display = 'none';
        }
    }

    function startLive() {
        if (liveInterval) return;
        isLiveActive = true;
        liveInterval = setInterval(() => {
            const params = getParams();
            if (!params || !params.live) {
                stopLive();
                tick();
                return;
            }
            const diff = computeDiff(params.start, new Date());
            updateUI(diff);
        }, 1000);
    }

    function stopLive() {
        if (liveInterval) {
            clearInterval(liveInterval);
            liveInterval = null;
        }
        isLiveActive = false;
        liveBadge.style.display = 'none';
        secondsCard.classList.remove('live-glow');
    }

    fromDate.addEventListener('change', () => { tick(); save(); });
    fromDate.addEventListener('input', () => { tick(); save(); });
    toDate.addEventListener('change', () => { tick(); save(); });
    toDate.addEventListener('input', () => { tick(); save(); });

    function generateText() {
        if (!currentDiff || !fromDate.value || !toDate.value) return 'No data available.';
        const d = currentDiff;
        let text = `📅 ZK Age Calculator\n`;
        text += `📆 From: ${fromDate.value}\n📆 To: ${toDate.value}\n`;
        text += `──────────────────\n`;
        text += `📊 Years: ${d.years.toLocaleString()}\n📊 Months: ${d.months.toLocaleString()}\n📊 Weeks: ${d.weeks.toLocaleString()}\n📊 Days: ${d.days.toLocaleString()}\n📊 Hours: ${d.hours.toLocaleString()}\n📊 Minutes: ${d.minutes.toLocaleString()}\n📊 Seconds: ${d.seconds.toLocaleString()}\n`;
        text += `──────────────────\n`;
        text += `📦 Total Months: ${d.totalMonths.toLocaleString()}\n🌍 Total Days: ${d.totalDays.toLocaleString()}\n⏱️ Total Hours: ${d.totalHours.toLocaleString()}\n`;
        text += `Developed by Hafiz Khalid Mahmood (0310-6465624)`;
        return text;
    }

    async function copyToClipboard() {
        const text = generateText();
        try {
            await navigator.clipboard.writeText(text);
            copyBtn.classList.add('copy-success');
            copyBtn.innerHTML = '✅ Copied';
            setTimeout(() => {
                copyBtn.classList.remove('copy-success');
                copyBtn.innerHTML = '📋 Copy';
            }, 2000);
        } catch (err) {
            const ta = document.createElement('textarea');
            ta.value = text;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            copyBtn.classList.add('copy-success');
            copyBtn.innerHTML = '✅ Copied';
            setTimeout(() => {
                copyBtn.classList.remove('copy-success');
                copyBtn.innerHTML = '📋 Copy';
            }, 2000);
        }
    }

    async function shareResult() {
        const text = generateText();
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'ZK Age Calculator',
                    text: text
                });
            } catch (err) {
                if (err.name !== 'AbortError') {
                    await copyToClipboard();
                    alert('Sharing failed. Results copied to clipboard instead.');
                }
            }
        } else {
            await copyToClipboard();
            alert('Share not supported on this device. Results copied to clipboard.');
        }
    }

    copyBtn.addEventListener('click', copyToClipboard);
    shareBtn.addEventListener('click', shareResult);

    resetBtn.addEventListener('click', () => {
        fromDate.value = '';
        toDate.value = '';
        clearDisplay();
        stopLive();
        liveBadge.style.display = 'none';
        localStorage.removeItem('zkAgeCalcOffline');
        resetBtn.style.transform = 'scale(0.95)';
        setTimeout(() => resetBtn.style.transform = 'scale(1)', 150);
    });

    function save() {
        try {
            localStorage.setItem('zkAgeCalcOffline', JSON.stringify({
                from: fromDate.value,
                to: toDate.value
            }));
        } catch (e) {}
    }

    function load() {
        try {
            const data = JSON.parse(localStorage.getItem('zkAgeCalcOffline'));
            if (data) {
                if (data.from) fromDate.value = data.from;
                if (data.to) toDate.value = data.to;
                return true;
            }
        } catch (e) {}
        return false;
    }

    function init() {
        const loaded = load();
        if (!loaded) {
            const today = new Date();
            const y = today.getFullYear();
            const m = String(today.getMonth()+1).padStart(2,'0');
            const d = String(today.getDate()).padStart(2,'0');
            toDate.value = `${y}-${m}-${d}`;
        }
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth()+1).padStart(2,'0');
        const dd = String(today.getDate()).padStart(2,'0');
        fromDate.setAttribute('max', `${yyyy}-${mm}-${dd}`);
        toDate.setAttribute('max', `${yyyy}-${mm}-${dd}`);
        tick();
    }

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stopLive();
        } else {
            tick();
        }
    });

    window.addEventListener('beforeunload', save);
    init();
})();