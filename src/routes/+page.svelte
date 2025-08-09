<script>
  import { user } from '$lib/stores/user';
  import { bmr, tdee, goals } from '$lib/utils/calories';
  import UserForm from '$lib/components/UserForm.svelte';
  import ResultCard from '$lib/components/ResultCard.svelte';
  import { get } from 'svelte/store';

  $: u = get(user);
  $: bmrValue = bmr(u);
  $: tdeeValue = tdee({ bmrValue, activityKey: u.activityKey });
  $: g = goals({ tdeeValue, weightKg: u.weightKg, cutPct: u.cutPct, bulkPct: u.bulkPct });
</script>

<svelte:head>
  <title>Calories Counter | BMR · TDEE · Deficit · Surplus</title>
  <meta name="description" content="Metric BMR & TDEE calculator with calorie deficit for fat loss and surplus for muscle gain. Fully client-side." />
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
    <UserForm showAdvanced={true} />

    <section class="grid">
      <ResultCard title="BMR"  kcal={bmrValue} proteinG={g.maintenance.proteinG} fatG={g.maintenance.fatG} carbsG={g.maintenance.carbsG} />
      <ResultCard title="TDEE (Maintenance)" kcal={tdeeValue} proteinG={g.maintenance.proteinG} fatG={g.maintenance.fatG} carbsG={g.maintenance.carbsG} />
      <ResultCard title="Cut (Deficit)" kcal={g.cut.kcal} proteinG={g.cut.proteinG} fatG={g.cut.fatG} carbsG={g.cut.carbsG} />
      <ResultCard title="Bulk (Surplus)" kcal={g.bulk.kcal} proteinG={g.bulk.proteinG} fatG={g.bulk.fatG} carbsG={g.bulk.carbsG} />
    </section>
  </main>
</div>

<style>
  :root {
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
  .grid { display:grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap:1rem; }
  @media (max-width: 900px) {
    .shell { grid-template-columns: 1fr; }
    aside { border-right: none; border-bottom:1px solid var(--line); }
    .grid { grid-template-columns: 1fr; }
  }
</style>
