<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AdminFlowTest extends TestCase
{
    use RefreshDatabase;

    private function login(): string
    {
        $user = User::create([
            'name' => 'Aniata Admin',
            'email' => 'admin@aniata.com',
            'password' => 'aniata-admin',
        ]);

        $res = $this->postJson('/api/admin/login', [
            'email' => 'admin@aniata.com',
            'password' => 'aniata-admin',
        ]);

        $res->assertStatus(200)
            ->assertJsonStructure(['token', 'user']);

        return $res->json('token');
    }

    private function authHeaders(string $token): array
    {
        return ['Authorization' => "Bearer $token", 'Accept' => 'application/json'];
    }

    private function fakeImage(string $name = 'prod.jpg')
    {
        // create() avoids the GD dependency that image() requires.
        return \Illuminate\Http\UploadedFile::fake()->create($name, 10, 'image/jpeg');
    }

    public function test_login_and_unauthenticated_is_rejected(): void
    {
        $this->getJson('/api/admin/products')->assertStatus(401);
        $this->putJson('/api/admin/settings', [])->assertStatus(401);
    }

    public function test_create_product(): void
    {
        $token = $this->login();

        $payload = [
            'name' => 'Hijab Pashmina Rose',
            'price' => 120000,
            'discount' => 10,
            'description' => 'A soft pashmina.',
            'colors' => [
                ['name' => 'Rose', 'sizes' => ['S', 'M'], 'images' => []],
                ['name' => 'Navy', 'sizes' => ['M'], 'images' => []],
            ],
            'sizes' => ['S', 'M'],
            'stock' => ['Rose|S' => 5, 'Rose|M' => 3, 'Navy|M' => 0],
            'image' => $this->fakeImage('rose.jpg'),
        ];

        $res = $this->postJson('/api/admin/products', $payload, $this->authHeaders($token));
        $res->assertStatus(201)
            ->assertJsonFragment(['name' => 'Hijab Pashmina Rose'])
            ->assertJsonPath('discount', 10)
            ->assertJsonPath('colors.0.name', 'Rose');

        $id = $res->json('id');
        $this->assertNotNull($id);
        $this->assertNotNull($res->json('slug'));
        $this->assertSame(5, (int) $res->json('stock.Rose|S'));
        $this->assertSame(0, (int) $res->json('stock.Navy|M'));

        // duplicated name gets a unique slug
        $dup = $this->postJson('/api/admin/products', $payload, $this->authHeaders($token));
        $dup->assertStatus(201);
        $this->assertNotSame($res->json('slug'), $dup->json('slug'));
    }

    public function test_update_product(): void
    {
        $token = $this->login();

        $create = $this->postJson('/api/admin/products', [
            'name' => 'Hijab Instant',
            'price' => 50000,
            'colors' => [['name' => 'Putih', 'sizes' => [], 'images' => []]],
            'sizes' => [],
            'stock' => [],
            'image' => $this->fakeImage('instant.jpg'),
        ], $this->authHeaders($token));
        $id = $create->json('id');

        $update = $this->putJson("/api/admin/products/$id", [
            'name' => 'Hijab Instant Edited',
            'price' => 65000,
            'discount' => 20,
            'colors' => [['name' => 'Putih', 'sizes' => ['L'], 'images' => []]],
            'sizes' => ['L'],
            'stock' => ['Putih|L' => 12],
        ], $this->authHeaders($token));

        $update->assertStatus(200)
            ->assertJsonPath('name', 'Hijab Instant Edited')
            ->assertJsonPath('price', 65000)
            ->assertJsonPath('discount', 20)
            ->assertJsonPath('stock.Putih|L', 12);
    }

    public function test_requires_at_least_one_image(): void
    {
        $token = $this->login();

        // No image anywhere -> rejected.
        $this->postJson('/api/admin/products', [
            'name' => 'No Image',
            'price' => 10000,
            'colors' => [],
            'sizes' => [],
            'stock' => [],
        ], $this->authHeaders($token))
            ->assertStatus(422)
            ->assertJsonValidationErrors(['image']);

        // With an image file -> created.
        $file = $this->fakeImage('prod.jpg');
        $res = $this->post('/api/admin/products', [
            'name' => 'With Image',
            'price' => 10000,
            'image' => $file,
            'colors' => [],
            'sizes' => [],
            'stock' => [],
        ], $this->authHeaders($token));

        $res->assertStatus(201)
            ->assertJsonPath('image', fn ($v) => ! empty($v));
    }

    public function test_delete_product(): void
    {
        $token = $this->login();
        $create = $this->postJson('/api/admin/products', [
            'name' => 'To Delete',
            'price' => 10000,
            'colors' => [],
            'sizes' => [],
            'stock' => [],
            'image' => $this->fakeImage('delete.jpg'),
        ], $this->authHeaders($token));
        $id = $create->json('id');

        $this->deleteJson("/api/admin/products/$id", [], $this->authHeaders($token))
            ->assertStatus(200)
            ->assertJson(['message' => 'Deleted']);

        $this->getJson('/api/admin/products', $this->authHeaders($token))
            ->assertJsonMissing(['name' => 'To Delete']);
    }

    public function test_settings_update_and_public_read(): void
    {
        $token = $this->login();

        $this->getJson('/api/admin/settings', $this->authHeaders($token))
            ->assertStatus(200);

        $res = $this->putJson('/api/admin/settings', [
            'cs_wa' => '628120000001',
            'cashier_wa' => '628120000002',
        ], $this->authHeaders($token));
        $res->assertStatus(200)
            ->assertJsonPath('cs_wa', '628120000001')
            ->assertJsonPath('cashier_wa', '628120000002');

        // public endpoint (no auth) exposes the numbers
        $this->getJson('/api/settings')
            ->assertStatus(200)
            ->assertJsonPath('cs_wa', '628120000001')
            ->assertJsonPath('cashier_wa', '628120000002');
    }

    public function test_change_password(): void
    {
        $token = $this->login();

        // wrong current password rejected
        $this->postJson('/api/admin/password', [
            'current_password' => 'wrong-pass',
            'password' => 'newpassword1',
            'password_confirmation' => 'newpassword1',
        ], $this->authHeaders($token))->assertStatus(422);

        // too short rejected
        $this->postJson('/api/admin/password', [
            'current_password' => 'aniata-admin',
            'password' => 'short',
            'password_confirmation' => 'short',
        ], $this->authHeaders($token))->assertStatus(422);

        // valid change
        $this->postJson('/api/admin/password', [
            'current_password' => 'aniata-admin',
            'password' => 'newpassword1',
            'password_confirmation' => 'newpassword1',
        ], $this->authHeaders($token))
            ->assertStatus(200)
            ->assertJson(['message' => 'Password diperbarui.']);

        // old password no longer works
        $this->postJson('/api/admin/login', [
            'email' => 'admin@aniata.com',
            'password' => 'aniata-admin',
        ])->assertStatus(401);

        // new password works
        $this->postJson('/api/admin/login', [
            'email' => 'admin@aniata.com',
            'password' => 'newpassword1',
        ])->assertStatus(200);

        // restore for repeatable runs
        User::where('email', 'admin@aniata.com')->update([
            'password' => Hash::make('aniata-admin'),
        ]);
    }
}
