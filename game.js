// game.js - initial state and rendering for MVP gamified dashboard

const STORAGE_KEY = 'canova_game_v1';

const initialState = {
  currentUser: {
    id: 'u1',
    name: 'Carina',
    initials: 'CT',
    role: 'mentor', // mentor | mentee | admin
    level: 3,
    xp: 420,
    hours: 18.5,
    streakWeeks: 4
  },
  quests: [
    { id: 'q1', title: 'Complete first reading lesson', category: 'Academic', completed: false },
    { id: 'q2', title: 'Set short-term career goal', category: 'Career', completed: false },
    { id: 'q3', title: 'Prepare personal introduction', category: 'Personal', completed: true }
  ],
  sessions: [
    { id: 's1', date: '2026-09-01', hours: 1.5, focus: 'Reading', note: 'Reviewed short story', status: 'Verified' },
    { id: 's2', date: '2026-09-08', hours: 2, focus: 'Conversation', note: 'Pronunciation practice', status: 'Pending' }
  ],
  badges: [
    { id: 'b1', name: 'Starter', unlockAt: 1, unlocked: true },
    { id: 'b2', name: '10 Hours', unlockAt: 10, unlocked: true },
    { id: 'b3', name: '25 Hours', unlockAt: 25, unlocked: false }
  ],
  skillTrees: {
    english: {
      id: 'english',
      title: 'English Skill Tree',
      subject: 'English',
      summary: 'Build confidence through vocabulary, reading, writing, speaking, and discussion.',
      nodes: [
        { id: 'vocab', title: 'Word Power', branch: 'Vocabulary', xp: 35, description: 'Build core vocabulary and confidence with everyday words.', tasks: ['Learn 10 everyday English words', 'Use them in 3 short sentences', 'Say them aloud in a quick practice round'], completed: true, requires: [] },
        { id: 'reading', title: 'Reading Fluency', branch: 'Reading', xp: 50, description: 'Practice short texts and sentence understanding.', tasks: ['Read a short passage aloud', 'Highlight 5 key ideas', 'Answer 3 comprehension prompts'], completed: false, requires: ['vocab'] },
        { id: 'grammar', title: 'Grammar Basics', branch: 'Grammar', xp: 55, description: 'Use key sentence patterns with confidence and clarity.', tasks: ['Identify subject and verb in 5 sentences', 'Rewrite 3 simple sentences', 'Practice one grammar mini-check'], completed: false, requires: ['vocab'] },
        { id: 'writing', title: 'Writing Basics', branch: 'Writing', xp: 60, description: 'Build simple sentence structure and writing flow.', tasks: ['Write 3 topic sentences', 'Add supporting detail to each one', 'Review grammar with a mentor'], completed: false, requires: ['grammar'] },
        { id: 'speaking', title: 'Conversation Spark', branch: 'Speaking', xp: 75, description: 'Speak with confidence in everyday situations.', tasks: ['Lead a 2-minute introduction', 'Practice a short conversation prompt', 'Ask and answer follow-up questions'], completed: false, requires: ['reading', 'grammar'] },
        { id: 'analysis', title: 'Discussion & Analysis', branch: 'Critical Thinking', xp: 85, description: 'Turn reading and writing into thoughtful discussion and response.', tasks: ['Share one opinion with support', 'Summarize a reading in your own words', 'Respond to a question with evidence'], completed: false, requires: ['reading', 'writing'] }
      ]
    }
  }
};

let state = loadState() || initialState;

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadState(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  }catch(e){return null}
}

// Utilities
function uid(prefix='id'){return prefix + Math.random().toString(36).slice(2,9)}
function formatDate(d){return new Date(d).toLocaleDateString()}

// Rendering
function renderHUD(){
  const u = state.currentUser;
  const avatar = document.getElementById('avatar');
  const playerLevel = document.getElementById('playerLevel');
  const playerStreak = document.getElementById('playerStreak');
  const hoursFill = document.getElementById('hoursFill');
  const hoursText = document.getElementById('hoursText');

  if (avatar) avatar.textContent = u.initials;
  if (playerLevel) playerLevel.textContent = `Level ${u.level} Scholar`;
  if (playerStreak) playerStreak.textContent = `🔥 ${u.streakWeeks}-Week Streak`;
  const pct = Math.min(100, Math.round((u.hours / 25) * 100));
  if (hoursFill) hoursFill.style.width = pct + '%';
  if (hoursText) hoursText.textContent = `${u.hours} / 25 hrs`;
}

function renderQuests(){
  const list = document.getElementById('questsList');
  if (!list) return;
  list.innerHTML = '';
  state.quests.forEach(q => {
    const card = document.createElement('div');
    card.className = 'quest-card';
    card.setAttribute('data-id', q.id);

    const meta = document.createElement('div');
    meta.className = 'quest-meta';
    const title = document.createElement('div');
    title.className = 'quest-title';
    title.textContent = q.title;
    const tag = document.createElement('div');
    tag.className = 'quest-tag';
    tag.textContent = q.category;
    meta.appendChild(title);
    meta.appendChild(tag);

    const actions = document.createElement('div');
    actions.className = 'quest-actions';
    const chk = document.createElement('div');
    chk.className = 'check-sat' + (q.completed ? ' completed' : '');
    chk.setAttribute('role','button');
    chk.setAttribute('aria-pressed', q.completed);
    chk.innerHTML = q.completed ? '✓' : '';
    chk.addEventListener('click', ()=> toggleQuestComplete(q.id));

    actions.appendChild(chk);

    card.appendChild(meta);
    card.appendChild(actions);
    list.appendChild(card);
  })
}

function toggleQuestComplete(id){
  const q = state.quests.find(x=>x.id===id);
  if(!q) return;
  q.completed = !q.completed;
  if(q.completed){
    // award small XP
    state.currentUser.xp += 25;
    state.currentUser.hours = Math.round((state.currentUser.hours + 0.1)*10)/10; // tiny reward
  }
  saveState();
  renderHUD();
  renderQuests();
}

// Quest modal handlers
function openQuestModal(){
  const m = document.getElementById('questModal');
  m.setAttribute('aria-hidden','false');
}
function closeQuestModal(){
  const m = document.getElementById('questModal');
  m.setAttribute('aria-hidden','true');
}

function handleQuestCreate(e){
  e.preventDefault();
  const title = document.getElementById('questTitle').value.trim();
  const category = document.getElementById('questCategory').value;
  if(!title) return;
  const q = { id: uid('q'), title, category, completed:false };
  state.quests.unshift(q);
  saveState();
  closeQuestModal();
  renderQuests();
  document.getElementById('questForm').reset();
}

// Sessions
function getSkillTreeState(tree){
  const nodes = tree.nodes.map((node) => {
    let status = 'locked';
    if (node.completed) {
      status = 'completed';
    } else {
      const requirementsMet = (node.requires || []).every((reqId) => {
        const requiredNode = tree.nodes.find((item) => item.id === reqId);
        return requiredNode && requiredNode.completed;
      });
      if (requirementsMet) status = 'available';
    }
    return { ...node, status };
  });
  return { ...tree, nodes };
}

function renderSkillTree(){
  const container = document.getElementById('skillTree');
  if (!container) return;

  const tree = getSkillTreeState(state.skillTrees.english);
  container.innerHTML = '';

  tree.nodes.forEach((node) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = `skill-node ${node.status}`;
    card.innerHTML = `
      <div class="top-row">
        <span class="skill-name">${node.title}</span>
        <span class="skill-xp">+${node.xp} XP</span>
      </div>
      <div class="skill-desc">${node.description}</div>
      <span class="skill-action">${node.status === 'completed' ? 'Completed' : node.status === 'available' ? 'Start' : 'Locked'}</span>
    `;

    if (node.status !== 'locked') {
      card.addEventListener('click', () => completeSkillNode(tree.id, node.id));
    }

    container.appendChild(card);
  });
}

function renderSkillMapPage(){
  const container = document.getElementById('skillTreeMap');
  const detailTitle = document.getElementById('skillDetailTitle');
  const detailDescription = document.getElementById('skillDetailDescription');
  const detailMeta = document.getElementById('skillDetailMeta');
  const detailTasks = document.getElementById('skillDetailTasks');
  const completeBtn = document.getElementById('completeSkillBtn');

  if (!container || !detailTitle || !detailDescription || !detailMeta || !detailTasks || !completeBtn) return;

  const tree = getSkillTreeState(state.skillTrees.english);
  const selectedNodeId = document.body.dataset.selectedSkillId || tree.nodes.find(node => !node.completed)?.id || tree.nodes[0].id;
  const selectedNode = tree.nodes.find(node => node.id === selectedNodeId) || tree.nodes[0];

  document.body.dataset.selectedSkillId = selectedNode.id;
  container.innerHTML = '';

  const root = document.createElement('div');
  root.className = 'tree-root';
  root.innerHTML = `<span class="root-tag">English Foundations</span><strong>Build confidence through language skills</strong>`;
  container.appendChild(root);

  const branchWrap = document.createElement('div');
  branchWrap.className = 'tree-branches';

  tree.nodes.forEach((node) => {
    const skillBtn = document.createElement('button');
    skillBtn.type = 'button';
    skillBtn.className = `tree-node ${node.status} ${selectedNode.id === node.id ? 'selected' : ''}`;
    skillBtn.innerHTML = `
      <span class="branch-label">${node.branch}</span>
      <strong>${node.title}</strong>
      <span class="branch-xp">+${node.xp} XP</span>
    `;
    skillBtn.addEventListener('click', () => {
      document.body.dataset.selectedSkillId = node.id;
      renderSkillMapPage();
    });
    if (node.status === 'locked') {
      skillBtn.disabled = true;
    }
    branchWrap.appendChild(skillBtn);
  });

  container.appendChild(branchWrap);

  detailTitle.textContent = selectedNode.title;
  detailDescription.textContent = selectedNode.description;
  detailMeta.innerHTML = `<span class="pill">${selectedNode.branch}</span><span class="pill accent">+${selectedNode.xp} XP</span>`;
  detailTasks.innerHTML = (selectedNode.tasks || []).map(task => `<li>${task}</li>`).join('');
  completeBtn.textContent = selectedNode.completed ? 'Completed' : 'Mark as complete';
  completeBtn.disabled = selectedNode.completed || selectedNode.status === 'locked';
  completeBtn.onclick = () => completeSkillNode('english', selectedNode.id);
}

function completeSkillNode(treeId, nodeId){
  const tree = state.skillTrees[treeId];
  if (!tree) return;

  const node = tree.nodes.find(item => item.id === nodeId);
  if (!node || node.completed) return;

  const requirementsMet = (node.requires || []).every((reqId) => {
    const requiredNode = tree.nodes.find((item) => item.id === reqId);
    return requiredNode && requiredNode.completed;
  });
  if (!requirementsMet) return;

  node.completed = true;
  state.currentUser.xp += node.xp;
  saveState();
  renderHUD();
  renderSkillTree();
  renderSkillMapPage();
}

function renderSessions(){
  const table = document.getElementById('sessionsTable');
  if (!table) return;
  const tbody = table.querySelector('tbody');
  if (!tbody) return;

  tbody.innerHTML = '';
  state.sessions.slice().reverse().forEach(s=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${formatDate(s.date)}</td><td>${s.hours}</td><td>${s.focus}</td><td>${s.note}</td><td class="status ${s.status.toLowerCase()}">${s.status}</td>`;
    tbody.appendChild(tr);
  });
}

function handleSessionSubmit(e){
  e.preventDefault();
  const date = document.getElementById('sessionDate').value;
  const hours = parseFloat(document.getElementById('sessionHours').value);
  const focus = document.getElementById('sessionFocus').value.trim();
  const note = document.getElementById('sessionNote').value.trim();
  if(!date || !hours || !focus) return;
  const s = { id: uid('s'), date, hours, focus, note, status: 'Pending' };
  state.sessions.push(s);
  // increment hours and award XP locally (verification later by admin)
  state.currentUser.hours = Math.round((state.currentUser.hours + hours)*10)/10;
  state.currentUser.xp += Math.round(hours * 50);
  saveState();
  renderSessions();
  renderHUD();
  document.getElementById('sessionForm').reset();
}

// Badges
function renderBadges(){
  const out = document.getElementById('badges');
  if (!out) return;
  out.innerHTML = '';
  state.badges.forEach(b => {
    const div = document.createElement('div');
    div.className = 'badge' + (b.unlocked || state.currentUser.hours>=b.unlockAt ? ' unlocked' : '');
    div.title = b.unlocked ? b.name : `Unlock at ${b.unlockAt} Hours`;
    div.innerHTML = `<div class="label">${b.name}</div>`;
    out.appendChild(div);
  })
}

// Wire up
function init(){
  // HUD and lists
  renderHUD();
  renderQuests();
  renderSkillTree();
  renderSessions();
  renderBadges();
  renderSkillMapPage();

  document.getElementById('addQuestBtn')?.addEventListener('click', openQuestModal);
  document.getElementById('closeQuestModal')?.addEventListener('click', closeQuestModal);
  document.getElementById('questForm')?.addEventListener('submit', handleQuestCreate);
  document.getElementById('sessionForm')?.addEventListener('submit', handleSessionSubmit);

  // Pre-fill date
  const dateInput = document.getElementById('sessionDate');
  if(dateInput) dateInput.value = new Date().toISOString().slice(0,10);
}

document.addEventListener('DOMContentLoaded', init);
