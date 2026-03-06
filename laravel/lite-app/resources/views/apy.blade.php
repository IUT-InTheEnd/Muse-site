<!DOCTYPE html>
<html lang="en">
<header>
    <title>API Manip for all user</title>
</header>
<body>
<h1>Manipulate API for All Users</h1>
@php
    use App\Models\User;
    use Illuminate\Support\Str;
    $users = User::all();
@endphp
@foreach($users as $user)
    <div>
        <p>{{ $user->email }}</p>
        <input id="schlafengehen-{{ $user->id }}-inputen" type="text">
        <button onclick="{
            let name = document.getElementById('schlafengehen-{{ $user->id }}-inputen').value
            window.open(`http://localhost:8000/api/token/create/{{ $user->id }}/${name}`, '_blank').focus();
        }" >Create token</button>
        @foreach($user->tokens as $token)
            <p>{{ $token }}</p>
        @endforeach

    </div>
@endforeach
</body>
</html>
