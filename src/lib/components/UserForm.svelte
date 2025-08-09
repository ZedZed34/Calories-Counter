<script>
  import { user } from '$lib/stores/user';
  import { ACTIVITY_LEVELS } from '$lib/utils/calories';
  import { get } from 'svelte/store';

  export let showAdvanced = true;

  let form = { ...get(user) };
  $: user.set(form); // keep store in sync as user types
</script>

<div class="card">
  <h2 class="title">Your Details (Metric)</h2>
  <div class="grid">
    <label>Sex
      <select bind:value={form.sex}>
        <option value="male">Male</option>
        <option value="female">Female</option>
      </select>
    </label>

    <label>Age (years)
      <input type="number" min="10" max="100" bind:value={form.age} />
    </label>

    <label>Height (cm)
      <input type="number" min="100" max="230" step="1" bind:value={form.heightCm} />
    </label>

    <label>Weight (kg)
      <input type="number" min="30" max="250" step="0.1" bind:value={form.weightKg} />
    </label>

    <label class="span-2">Activity Level
      <select bind:value={form.activityKey}>
        {#each ACTIVITY_LEVELS as lvl}
          <option value={lvl.key}>{lvl.label}</option>
        {/each}
      </select>
    </label>

    {#if showAdvanced}
      <label>Cut % (deficit)
        <input type="number" min="0.05" max="0.35" step="0.01" bind:value={form.cutPct} />
      </label>
      <label>Bulk % (surplus)
        <input type="number" min="0.05" max="0.25" step="0.01" bind:value={form.bulkPct} />
      </label>
    {/if}
  </div>
</div>

<style>
  .card { padding: 1rem; border-radius: 12px; background: var(--surface); box-shadow: var(--shadow); }
  .title { margin: 0 0 .75rem 0; }
  .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .75rem; }
  .span-2 { grid-column: span 2; }
  label { display:flex; flex-direction:column; gap:.25rem; font-size:.95rem; }
  input, select { padding:.6rem .7rem; border:1px solid var(--line); border-radius:8px; background:var(--bg); }
</style>
