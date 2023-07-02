use macroquad::prelude::*;
use std::fmt::Write;

#[macroquad::main("fishe")]
async fn main() {
    let mut overlay_text = String::new();

    let mut fps = 0.0;
    let mut frame_time = 0.0;
    let alpha = 0.9;

    loop {
        let current_time = get_time();

        clear_background(BLACK);

        // 3D
        set_camera(&Camera3D {
            position: Affine3A::from_rotation_translation(
                Quat::from_rotation_z(current_time as f32),
                Vec3::Z * f32::sin(current_time as f32) * 10.0,
            )
            .transform_point3(Vec3::new(10.0, 10.0, 0.0)),
            up: Vec3::Z,
            target: Vec3::ZERO,
            projection: Projection::Perspective,
            ..Default::default()
        });

        draw_line_3d(Vec3::X * -10.0, Vec3::X * 10.0, RED);
        draw_line_3d(Vec3::Y * -10.0, Vec3::Y * 10.0, GREEN);
        draw_line_3d(Vec3::Z * -10.0, Vec3::Z * 10.0, BLUE);

        draw_cube_wires(
            Vec3::new(0.0, 0.0, 0.0),
            Vec3::new(10.0, 10.0, 10.0),
            Color::new(0.5, 1.0, 0.5, 1.0),
        );

        // 2D
        set_default_camera();

        overlay_text.clear();
        fps = alpha * fps + (1.0 - alpha) * get_fps() as f32;
        write!(overlay_text, "FPS: {:.0}", fps).unwrap();
        draw_text(&overlay_text, 10.0, 20.0, 30.0, WHITE);
        overlay_text.clear();
        frame_time = alpha * frame_time + (1.0 - alpha) * get_frame_time() * 1000.0;
        write!(overlay_text, "Frame Time: {:.1}ms", frame_time).unwrap();
        draw_text(&overlay_text, 10.0, 50.0, 30.0, WHITE);
        overlay_text.clear();
        write!(overlay_text, "Current Time: {:.4}", current_time).unwrap();
        draw_text(&overlay_text, 10.0, 80.0, 30.0, WHITE);
        next_frame().await;
    }
}

async fn load_gltf() {
    let file = load_file("textures/high_detailed_fish/scene.gltf").await;
}
