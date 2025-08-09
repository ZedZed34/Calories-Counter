<script>
  import { user } from '$lib/stores/user';
  import { bmr, tdee, goals } from '$lib/utils/calories';
  import UserForm from '$lib/components/UserForm.svelte';
  import ResultCard from '$lib/components/ResultCard.svelte';
  import { get } from 'svelte/store';
  
  let showResults = false;
  let g = { maintenance: {}, cut: {}, bulk: {} };
  
  function handleCalculate(event) {
    const userData = event.detail;
    
    // Validate that all required fields are filled
    if (!userData.sex || !userData.age || !userData.heightCm || !userData.weightKg || !userData.activityKey || !userData.targetWeightKg) {
      alert('Please fill in all fields before calculating.');
      return;
    }
    
    showResults = true;
    const bmrValue = bmr(userData);
    const tdeeValue = tdee({ bmrValue, activityKey: userData.activityKey });
    g = goals({ tdeeValue, weightKg: userData.weightKg, targetWeightKg: userData.targetWeightKg });
  }
</script>

<svelte:head>
  <title>Calorie Goals: Deficit & Surplus</title>
  <meta name="description" content="Daily calories for fat loss (deficit) and muscle gain/weight gain (surplus), metric units." />
</svelte:head>

<div class="shell">
  <aside>
    <h1>Calories Counter</h1>
    <nav>
      <a href="/">Overview</a>
      <a href="/bmr">BMR</a>
      <a href="/tdee">TDEE</a>
      <a href="/goals">Goals</a>
    </nav>
  </aside>

  <main>
    <h2>Goals</h2>
    <UserForm showAdvanced={true} on:calculate={handleCalculate} />
    {#if showResults}
      <div class="grid" style="margin-top:.75rem">
        <ResultCard title="Maintenance" {...g.maintenance} />
        <ResultCard title="Cut (Deficit)" {...g.cut} />
        <ResultCard title="Bulk (Surplus)" {...g.bulk} />
      </div>
    {:else}
      <div class="placeholder">
        <p>Enter your target weight goal and click "Get Result" to see your customized calorie plan for reaching your goal!</p>
      </div>
    {/if}
  </main>
</div>

<style>
  :global(:root) {
    --bg: #0b0d10;
    --surface: #131820;
    --line: #2a3441;
    --muted: #93a0b0;
    --shadow: 0 6px 20px rgba(0,0,0,.25);
  }
  .shell { display:grid; grid-template-columns: 260px 1fr; min-height: 100dvh; background: var(--bg); color: #e8edf4; }
  aside { padding:1.25rem; border-right:1px solid var(--line); }
  aside h1 { margin:0 0 .75rem 0; font-size:1.25rem; }
  nav { display:flex; flex-direction:column; gap:.5rem; }
  nav a { color:#e8edf4; text-decoration:none; opacity:.85; }
  nav a:hover { opacity:1; }
  main { padding:1.25rem; display:flex; flex-direction:column; gap:1rem; }
  .grid { display:grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap:1rem; }
  .placeholder { 
    text-align: center; 
    padding: 3rem 2rem; 
    background: var(--surface); 
    border-radius: 12px; 
    margin-top: 1rem;
    border: 2px dashed var(--line);
  }
  .placeholder p { 
    color: var(--muted); 
    font-size: 1.1rem;
    margin: 0;
  }
  @media (max-width: 900px) {
    .shell { grid-template-columns: 1fr; }
    aside { border-right: none; border-bottom:1px solid var(--line); }
    .grid { grid-template-columns: 1fr; }
  }
</style>
