<?php
/**
 * Plugin Name: Moiré Block
 * Description: A Gutenberg group block with live Moiré pattern canvas background
 * Version: 1.0.0
 * Author: Moiré Studio
 * License: GPL-2.0-or-later
 * Text Domain: moire-block
 */

if (!defined('ABSPATH')) {
    exit;
}

function moire_block_register() {
    register_block_type(__DIR__ . '/build');
}
add_action('init', 'moire_block_register');

// Enqueue frontend view script
function moire_block_enqueue_view_script() {
    if (has_block('moire-block/moire-group')) {
        wp_enqueue_script(
            'moire-block-view',
            plugins_url('build/view.js', __FILE__),
            array(),
            filemtime(plugin_dir_path(__FILE__) . 'build/view.js'),
            true
        );
    }
}
add_action('wp_enqueue_scripts', 'moire_block_enqueue_view_script');
