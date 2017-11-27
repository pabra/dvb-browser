<template lang="pug">
    transition(name="overlay")
        div.modal(ref="modal" @click.once.self="destroyClick")
            div.overlay
                div(:is="component")
                div.close.button.button-primary(@click.once="destroyClick")
                    i.material-icons close
</template>

<script>
    export default {
        name: 'overlay',
        props: {
            component: {
                type: Object,
                default: null,
            },
        },
        methods: {
            destroyClick(ev) {
                ev.stopPropagation();
                ev.preventDefault();
                this.$emit('destroy');
                return false;
            },
        },
    };
</script>

<style lang="scss" scoped>
    .modal {
        position: fixed;
        background-color: rgba(0,0,0, 0.2);
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
    }

    .close {
        position: absolute;
        top: -10px;
        right: -10px;
        width: 30px;
        height: 30px;
        line-height: 30px;
        font-size: 30px;
        text-align: center;
        border-radius: 50px;
        box-shadow: 0px 0px 20px 0px rgba(0,0,0, 0.3);

        &:hover {
            box-shadow: 0px 0px 20px 0px rgba(0,0,0, 0.4);
        }

        i {
            vertical-align: bottom;
        }
    }

    .overlay {
        box-shadow: 0 0 200px -30px black;
        padding: 10px;
        position: absolute;
        top: 40px;
        left: 10px;
        max-width: 89%;
        background-color: #fff;
        border: 1px solid #999;
        border-radius: 5px;
    }

    .overlay-enter, .overlay-leave-active {
        opacity: 0;
        top: -200px !important;
    }
</style>
