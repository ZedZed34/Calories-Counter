<script>
  import { user } from '$lib/stores/user';
  import { bmr, tdee } from '$lib/utils/calories';
  import UserForm from '$lib/components/UserForm.svelte';
  import { get } from 'svelte/store';
  $: u = get(user);
</script>

<svelte:head>
  <title>TDEE Calculator (Metric)</title>
  <meta name="description" content="Calculate TDEE using activity multipliers (metric)." />
</svelte:head>

<h2>TDEE (Total Daily Energy Expenditure)</h2>
<UserForm showAdvanced={false} />
<p style="margin-top:.5rem">Your TDEE (maintenance): <strong>{tdee({ bmrValue: bmr(u), activityKey: u.activityKey })} kcal/day</strong></p>
