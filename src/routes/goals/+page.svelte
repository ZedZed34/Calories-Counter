<script>
  import { user } from '$lib/stores/user';
  import { bmr, tdee, goals } from '$lib/utils/calories';
  import UserForm from '$lib/components/UserForm.svelte';
  import ResultCard from '$lib/components/ResultCard.svelte';
  import { get } from 'svelte/store';
  $: u = get(user);
  $: b = bmr(u);
  $: t = tdee({ bmrValue: b, activityKey: u.activityKey });
  $: g = goals({ tdeeValue: t, weightKg: u.weightKg, cutPct: u.cutPct, bulkPct: u.bulkPct });
</script>

<svelte:head>
  <title>Calorie Goals: Deficit & Surplus</title>
  <meta name="description" content="Daily calories for fat loss (deficit) and muscle gain/weight gain (surplus), metric units." />
</svelte:head>

<h2>Goals</h2>
<UserForm showAdvanced={true} />
<div class="grid" style="margin-top:.75rem">
  <ResultCard title="Maintenance" {...g.maintenance} />
  <ResultCard title="Cut (Deficit)" {...g.cut} />
  <ResultCard title="Bulk (Surplus)" {...g.bulk} />
</div>
