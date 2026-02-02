<!DOCTYPE html>
<html lang="en">
<header>
    <title>Gen password for all user</title>
</header>
<body>
    <h1>Generate Password for All Users</h1>
    @php
    use App\Models\User;
    use Illuminate\Support\Str;
    $users = User::all();
    foreach ($users as $user) {
        $newPassword = 'MotDePasse' . $user->id . '!';
        $user->password = bcrypt($newPassword);
        $user->save();
        echo "User: " . $user->email . " - New Password: " . $newPassword . "<br>";
    }
    @endphp
</body>
</html>
